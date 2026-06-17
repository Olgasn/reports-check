namespace ReportsCheck.Domain.Entities;

/// <summary>
/// GitHub-репозиторий студента по конкретной дисциплине (курсу).
/// Один репозиторий на пару (студент, дисциплина).
/// </summary>
public class StudentRepository : BaseEntity
{
    /// <summary>Полное имя репозитория на латинице, напр. «PI21_BD_05».</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>HTML-адрес репозитория на GitHub.</summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>Статус: «Created» / «Failed».</summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>Текст последней ошибки (если создание не удалось).</summary>
    public string? Error { get; set; }

    /// <summary>Отправлено ли студенту письмо-приглашение.</summary>
    public bool InvitationEmailed { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EmailedAt { get; set; }

    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;
}
