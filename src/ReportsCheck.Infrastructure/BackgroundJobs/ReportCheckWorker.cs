using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ReportsCheck.Application.Notifications;
using ReportsCheck.Application.Reports;
using ReportsCheck.Application.Reports.Strategies;

namespace ReportsCheck.Infrastructure.BackgroundJobs;

/// <summary>
/// Фоновая обработка заданий проверки. Порт ReportsService.handleCheckReports
/// (fire-and-forget) + аналог SubmissionProcessingWorker из PersonalLearning.
/// </summary>
public class ReportCheckWorker : BackgroundService
{
    private readonly IReportCheckQueue _queue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly INotificationService _notification;
    private readonly ILogger<ReportCheckWorker> _logger;

    public ReportCheckWorker(
        IReportCheckQueue queue,
        IServiceScopeFactory scopeFactory,
        INotificationService notification,
        ILogger<ReportCheckWorker> logger)
    {
        _queue = queue;
        _scopeFactory = scopeFactory;
        _notification = notification;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            ReportCheckJob job;
            try
            {
                job = await _queue.DequeueAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }

            await ProcessAsync(job, stoppingToken);
        }
    }

    private async Task ProcessAsync(ReportCheckJob job, CancellationToken cancellationToken)
    {
        try
        {
            _notification.CheckStarted();

            await using var scope = _scopeFactory.CreateAsyncScope();
            var factory = scope.ServiceProvider.GetRequiredService<IReportStrategyFactory>();
            var strategy = factory.GetStrategy(job.ModelsId.Count);

            var results = await strategy.CheckAsync(job, cancellationToken);
            var ids = results.Select(c => c.Id).ToList();

            _notification.ReportsChecked(ids, job.LabId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при проверке отчётов лабораторной {LabId}", job.LabId);
            _notification.CheckFailed(job.LabId, ex.Message);
        }
    }
}
