namespace ReportsCheck.Application.Reports;

/// <summary>
/// Очередь заданий на проверку. Замена fire-and-forget setImmediate +
/// аналог SubmissionQueue из PersonalLearning (Channel&lt;T&gt;).
/// </summary>
public interface IReportCheckQueue
{
    ValueTask EnqueueAsync(ReportCheckJob job, CancellationToken cancellationToken = default);

    ValueTask<ReportCheckJob> DequeueAsync(CancellationToken cancellationToken);
}
