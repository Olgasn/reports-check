namespace ReportsCheck.Application.GitHub;

/// <summary>
/// Создание учебного GitHub-репозитория студента и выдача ему прав администратора.
/// Реализация берёт токен/организацию/владельца из настроек приложения (БД).
/// </summary>
public interface IGitHubRepositoryService
{
    Task<GitHubRepoResult> CreateRepositoryAsync(GitHubRepoRequest request, CancellationToken cancellationToken = default);
}

/// <param name="Name">Имя репозитория на латинице (см. <see cref="RepositoryNaming"/>).</param>
/// <param name="FullName">ФИО студента (для Readme.md).</param>
/// <param name="GroupName">Название группы (для Readme.md).</param>
/// <param name="CourseName">Название дисциплины (для Readme.md).</param>
/// <param name="GitHubUsername">Логин GitHub студента; если задан — приглашается админом.</param>
public record GitHubRepoRequest(
    string Name,
    string FullName,
    string GroupName,
    string CourseName,
    string? GitHubUsername);

/// <param name="Url">HTML-адрес созданного репозитория.</param>
/// <param name="AdminGranted">Было ли отправлено приглашение студенту-администратору.</param>
public record GitHubRepoResult(string Url, bool AdminGranted);
