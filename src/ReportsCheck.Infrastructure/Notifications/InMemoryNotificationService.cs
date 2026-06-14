using ReportsCheck.Application.Notifications;

namespace ReportsCheck.Infrastructure.Notifications;

/// <summary>
/// Замена Socket.IO-вещания. Singleton: все Blazor-круги (circuits) подписываются
/// на одни и те же события, поэтому вызов транслируется всем клиентам.
/// Порт NotificationService + WsGateway.sendToUser.
/// </summary>
public class InMemoryNotificationService : INotificationService
{
    public event Action? OnCheckStarted;
    public event Action<ReportProgress>? OnReportProgress;
    public event Action<ReportsCheckedNotification>? OnReportsChecked;
    public event Action<CheckFailedNotification>? OnCheckFailed;

    public void ReportOneStarted(string student, string model, int id, int labId) =>
        OnReportProgress?.Invoke(new ReportProgress(student, model, id, labId, "started"));

    public void ReportOneChecked(string student, string model, int id, int labId) =>
        OnReportProgress?.Invoke(new ReportProgress(student, model, id, labId, "checked"));

    public void ReportOneFailed(string student, string model, int id, int labId) =>
        OnReportProgress?.Invoke(new ReportProgress(student, model, id, labId, "failed"));

    public void ReportsChecked(IReadOnlyList<int> ids, int labId) =>
        OnReportsChecked?.Invoke(new ReportsCheckedNotification(ids, labId));

    public void CheckStarted() => OnCheckStarted?.Invoke();

    public void CheckFailed(int labId, string reason = "Неизвестная ошибка") =>
        OnCheckFailed?.Invoke(new CheckFailedNotification(labId, reason));
}
