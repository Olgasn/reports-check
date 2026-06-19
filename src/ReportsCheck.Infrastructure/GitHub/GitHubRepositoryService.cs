using Microsoft.Extensions.Logging;
using Octokit;
using ReportsCheck.Application.GitHub;
using ReportsCheck.Application.Settings;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Infrastructure.GitHub;

/// <summary>
/// Создаёт учебный репозиторий в организации GitHub и наполняет его структурой
/// (6 лабораторных). При наличии логина студента приглашает его администратором.
/// Файлы заливаются через Contents API (по файлу за коммит): низкоуровневый Git Data API
/// сразу после AutoInit отвечает 404 на запись, а Contents API уже работает.
/// </summary>
public class GitHubRepositoryService : IGitHubRepositoryService
{
    private readonly ISettingsService _settings;
    private readonly ILogger<GitHubRepositoryService> _logger;

    public GitHubRepositoryService(ISettingsService settings, ILogger<GitHubRepositoryService> logger)
    {
        _settings = settings;
        _logger = logger;
    }

    public async Task<GitHubRepoResult> CreateRepositoryAsync(GitHubRepoRequest request, CancellationToken cancellationToken = default)
    {
        var (client, org, settings) = await CreateClientAsync(cancellationToken);

        var repo = await client.Repository.Create(org, new NewRepository(request.Name)
        {
            Private = settings.RepoPrivate,
            AutoInit = true,
            Description = $"{request.CourseName} — {request.FullName} ({request.GroupName})",
        });

        var branch = string.IsNullOrWhiteSpace(repo.DefaultBranch) ? "main" : repo.DefaultBranch;

        // Сразу после Repository.Create бэкенд Git Data API у GitHub иногда ещё не готов
        // (репозиторий создаётся асинхронно) — Tree.Create/Reference.Get отвечают 404.
        // Ждём, пока ветка с автокоммитом не станет видимой, прежде чем продолжать.
        await WaitForBranchAsync(client, org, request.Name, branch, cancellationToken);

        // Наполняем структуру через Contents API (по файлу за коммит). AutoInit уже создал
        // README.md — наш одноимённый файл его перезаписывает, остальные создаются заново.
        var files = RepositoryTemplate.BuildFiles(request.FullName, request.GroupName, request.CourseName);
        await BuildStructureAsync(client, org, request.Name, branch, files, cancellationToken);

        // Права администратора студенту (если известен логин GitHub).
        var adminGranted = false;
        if (!string.IsNullOrWhiteSpace(request.GitHubUsername))
        {
            await client.Repository.Collaborator.Add(org, request.Name, request.GitHubUsername, new CollaboratorRequest("admin"));
            adminGranted = true;
        }

        _logger.LogInformation("Создан репозиторий {Name} ({Url}), права администратора: {Admin}", request.Name, repo.HtmlUrl, adminGranted);

        return new GitHubRepoResult(repo.HtmlUrl, adminGranted);
    }

    public async Task DeleteRepositoryAsync(string name, CancellationToken cancellationToken = default)
    {
        var (client, org, _) = await CreateClientAsync(cancellationToken);

        try
        {
            await client.Repository.Delete(org, name);
            _logger.LogInformation("Удалён репозиторий {Name}", name);
        }
        catch (NotFoundException)
        {
            // Репозиторий уже отсутствует на GitHub — считаем удаление успешным.
            _logger.LogWarning("Репозиторий {Name} не найден на GitHub, удаление пропущено", name);
        }
    }

    private async Task<(GitHubClient Client, string Org, AppSettings Settings)> CreateClientAsync(CancellationToken cancellationToken)
    {
        var settings = await _settings.GetAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(settings.GitHubToken))
        {
            throw new InvalidOperationException("Не задан GitHub-токен. Заполните настройки.");
        }

        if (string.IsNullOrWhiteSpace(settings.GitHubOrg))
        {
            throw new InvalidOperationException("Не задана организация GitHub.");
        }

        var client = new GitHubClient(new ProductHeaderValue("ReportsCheck"))
        {
            // Обрезаем пробелы/переносы — частая причина «Bad credentials» при вставке токена.
            Credentials = new Credentials(settings.GitHubToken.Trim()),
        };

        return (client, settings.GitHubOrg, settings);
    }

    /// <summary>
    /// Создаёт/обновляет все файлы структуры через Contents API. Между записями в один
    /// репозиторий выдерживаем паузу — GitHub просит не частить с изменяющими запросами.
    /// </summary>
    private static async Task BuildStructureAsync(
        GitHubClient client,
        string org,
        string repoName,
        string branch,
        IReadOnlyDictionary<string, string> files,
        CancellationToken cancellationToken)
    {
        foreach (var (path, content) in files)
        {
            await UpsertFileAsync(client, org, repoName, branch, path, content, cancellationToken);
            await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
        }
    }

    /// <summary>
    /// Создаёт файл, а если он уже существует (например, README.md от AutoInit) — обновляет его.
    /// Сразу после создания репозитория Contents API может отдать транзиентный 404 — повторяем.
    /// </summary>
    private static async Task UpsertFileAsync(
        GitHubClient client,
        string org,
        string repoName,
        string branch,
        string path,
        string content,
        CancellationToken cancellationToken)
    {
        const int maxAttempts = 5;
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                try
                {
                    await client.Repository.Content.CreateFile(org, repoName, path,
                        new CreateFileRequest($"Добавлен {path}", content, branch));
                }
                catch (ApiValidationException)
                {
                    // Файл уже есть — обновляем по его sha.
                    var existing = await client.Repository.Content.GetAllContentsByRef(org, repoName, path, branch);
                    await client.Repository.Content.UpdateFile(org, repoName, path,
                        new UpdateFileRequest($"Обновлён {path}", content, existing[0].Sha, branch));
                }

                return;
            }
            catch (NotFoundException) when (attempt < maxAttempts)
            {
                await Task.Delay(TimeSpan.FromSeconds(2), cancellationToken);
            }
        }
    }

    private static async Task WaitForBranchAsync(GitHubClient client, string org, string repoName, string branch, CancellationToken cancellationToken)
    {
        const int maxAttempts = 5;
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                await client.Git.Reference.Get(org, repoName, $"heads/{branch}");
                return;
            }
            catch (NotFoundException) when (attempt < maxAttempts)
            {
                await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
            }
        }
    }
}
