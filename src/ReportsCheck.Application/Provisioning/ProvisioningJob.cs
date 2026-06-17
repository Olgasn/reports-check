namespace ReportsCheck.Application.Provisioning;

public enum ProvisioningJobKind
{
    /// <summary>Создать репозитории студентам выбранной группы по дисциплине.</summary>
    CreateRepos,

    /// <summary>Разослать студентам письма-приглашения по созданным репозиториям.</summary>
    SendInvitations,
}

/// <summary>
/// Фоновое задание для создания репозиториев или рассылки приглашений.
/// </summary>
public class ProvisioningJob
{
    public required ProvisioningJobKind Kind { get; init; }
    public required int CourseId { get; init; }
    public required int GroupId { get; init; }

    /// <summary>Конкретные студенты; пустой список — все студенты группы.</summary>
    public IReadOnlyList<int> StudentIds { get; init; } = [];
}
