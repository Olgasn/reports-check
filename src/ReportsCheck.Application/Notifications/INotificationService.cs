namespace ReportsCheck.Application.Notifications;

/// <summary>
/// Прогресс проверки одного отчёта. status: 'started' | 'checked' | 'failed'.
/// </summary>
public record ReportProgress(string Student, string Model, int Id, int LabId, string Status);

public record ReportsCheckedNotification(IReadOnlyList<int> Ids, int LabId);

public record CheckFailedNotification(int LabId, string Reason);

/// <summary>
/// Замена Socket.IO-вещания. Singleton: события транслируются всем подключённым
/// Blazor-кругам (circuits). Порт NotificationService + WsGateway.sendToUser.
/// </summary>
public interface INotificationService
{
    void ReportOneStarted(string student, string model, int id, int labId);
    void ReportOneChecked(string student, string model, int id, int labId);
    void ReportOneFailed(string student, string model, int id, int labId);
    void ReportsChecked(IReadOnlyList<int> ids, int labId);
    void CheckStarted();
    void CheckFailed(int labId, string reason = "Неизвестная ошибка");

    event Action? OnCheckStarted;
    event Action<ReportProgress>? OnReportProgress;
    event Action<ReportsCheckedNotification>? OnReportsChecked;
    event Action<CheckFailedNotification>? OnCheckFailed;
}
