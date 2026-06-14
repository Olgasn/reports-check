using ReportsCheck.Application.Files;
using ReportsCheck.Application.Notifications;
using ReportsCheck.Application.Reports.Models;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Application.Reports.Strategies;

/// <summary>
/// Одна модель проверяет все отчёты параллельно. Порт OneModelStrategy.
/// </summary>
public class OneModelStrategy : IReportStrategy
{
    private readonly ReportChecker _reportChecker;
    private readonly IReportDataProvider _dataProvider;
    private readonly IFileParsingService _fileParsing;
    private readonly INotificationService _notification;

    public OneModelStrategy(
        ReportChecker reportChecker,
        IReportDataProvider dataProvider,
        IFileParsingService fileParsing,
        INotificationService notification)
    {
        _reportChecker = reportChecker;
        _dataProvider = dataProvider;
        _fileParsing = fileParsing;
        _notification = notification;
    }

    public async Task<IReadOnlyList<Check>> CheckAsync(ReportCheckJob job, CancellationToken cancellationToken = default)
    {
        var modelId = job.ModelsId.Count > 0 ? job.ModelsId[0] : throw new InvalidOperationException("No model");

        var lab = await _dataProvider.GetLabWithCoursePromptAsync(job.LabId, cancellationToken);
        var model = await _dataProvider.GetModelWithRelationsAsync(modelId, cancellationToken);

        var content = lab.Course.Prompt?.Content ?? string.Empty;
        var task = lab.Content;
        var reportsData = await GetReportsDataAsync(job, cancellationToken);

        var tasks = reportsData.Select(report => CheckReportSafelyAsync(report, task, content, model, job, lab.Id, cancellationToken)).ToList();
        var settled = await Task.WhenAll(tasks);

        var results = settled.Where(r => r.Success).Select(r => r.Result!).ToList();

        if (results.Count == 0 && settled.Length > 0 && !settled[0].Success)
        {
            throw new InvalidOperationException(settled[0].Error);
        }

        return await _reportChecker.CreateChecksAsync(results, model.Id, lab.Id, cancellationToken);
    }

    private async Task<(bool Success, CheckResult? Result, string? Error)> CheckReportSafelyAsync(
        ParsedReport report, string task, string content, Model model, ReportCheckJob job, int labId, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _reportChecker.CheckOneReportAsync(report, task, content, model, job.GroupId, job.CheckPrev, labId, cancellationToken);
            return (true, result, null);
        }
        catch (Exception ex)
        {
            var studentStr = $"{report.Name} {report.Surname} {report.Middlename}";
            _notification.ReportOneFailed(studentStr, model.Name, 0, labId);
            return (false, null, ex.Message);
        }
    }

    private async Task<IReadOnlyList<ParsedReport>> GetReportsDataAsync(ReportCheckJob job, CancellationToken cancellationToken)
    {
        var data = await ResolveReportsAsync(job, cancellationToken);

        return job.StudentsId.Count > 0
            ? data.Where(rp => job.StudentsId.Any(st => ReportStudentMatch.IsSimilar(rp, st))).ToList()
            : data;
    }

    private async Task<IReadOnlyList<ParsedReport>> ResolveReportsAsync(ReportCheckJob job, CancellationToken cancellationToken)
    {
        if (job.ReportsZip is not null)
        {
            return await _fileParsing.ParseArchiveAsync(job.ReportsZip.Content, cancellationToken);
        }

        if (job.ReportFile is not null)
        {
            var student = job.StudentsId.Count > 0 ? job.StudentsId[0] : null;
            return await _fileParsing.ParseSingleReportAsync(job.ReportFile.FileName, job.ReportFile.Content, student, cancellationToken);
        }

        throw new InvalidOperationException("Не переданы файлы отчета для проверки");
    }
}
