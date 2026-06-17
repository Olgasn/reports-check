using System.Threading.Channels;
using ReportsCheck.Application.Provisioning;

namespace ReportsCheck.Infrastructure.BackgroundJobs;

/// <summary>
/// Очередь заданий на создание репозиториев и рассылку приглашений
/// поверх Channel&lt;T&gt; (по образцу <see cref="ReportCheckQueue"/>).
/// </summary>
public class ProvisioningQueue : IProvisioningQueue
{
    private readonly Channel<ProvisioningJob> _channel =
        Channel.CreateUnbounded<ProvisioningJob>(new UnboundedChannelOptions { SingleReader = true });

    public ValueTask EnqueueAsync(ProvisioningJob job, CancellationToken cancellationToken = default) =>
        _channel.Writer.WriteAsync(job, cancellationToken);

    public ValueTask<ProvisioningJob> DequeueAsync(CancellationToken cancellationToken) =>
        _channel.Reader.ReadAsync(cancellationToken);
}
