namespace ReportsCheck.Application.Provisioning;

/// <summary>
/// Очередь фоновых заданий по созданию репозиториев и рассылке приглашений
/// (поверх Channel&lt;T&gt;, по образцу <c>IReportCheckQueue</c>).
/// </summary>
public interface IProvisioningQueue
{
    ValueTask EnqueueAsync(ProvisioningJob job, CancellationToken cancellationToken = default);

    ValueTask<ProvisioningJob> DequeueAsync(CancellationToken cancellationToken);
}
