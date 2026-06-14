using System.Threading.Channels;
using ReportsCheck.Application.Reports;

namespace ReportsCheck.Infrastructure.BackgroundJobs;

/// <summary>
/// Очередь заданий на проверку поверх Channel&lt;T&gt;. Аналог SubmissionQueue
/// из PersonalLearning; заменяет fire-and-forget setImmediate.
/// </summary>
public class ReportCheckQueue : IReportCheckQueue
{
    private readonly Channel<ReportCheckJob> _channel =
        Channel.CreateUnbounded<ReportCheckJob>(new UnboundedChannelOptions { SingleReader = true });

    public ValueTask EnqueueAsync(ReportCheckJob job, CancellationToken cancellationToken = default) =>
        _channel.Writer.WriteAsync(job, cancellationToken);

    public ValueTask<ReportCheckJob> DequeueAsync(CancellationToken cancellationToken) =>
        _channel.Reader.ReadAsync(cancellationToken);
}
