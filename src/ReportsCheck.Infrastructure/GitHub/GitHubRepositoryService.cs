using Microsoft.Extensions.Logging;
using Octokit;
using ReportsCheck.Application.GitHub;
using ReportsCheck.Application.Settings;

namespace ReportsCheck.Infrastructure.GitHub;

/// <summary>
/// Создаёт учебный репозиторий в организации GitHub и наполняет его структурой
/// (6 лабораторных). При наличии логина студента приглашает его администратором.
/// Использует Git Data API: один атомарный коммит со всеми файлами.
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
            Credentials = new Credentials(settings.GitHubToken),
        };

        var org = settings.GitHubOrg;

        var repo = await client.Repository.Create(org, new NewRepository(request.Name)
        {
            Private = settings.RepoPrivate,
            AutoInit = false,
            Description = $"{request.CourseName} — {request.FullName} ({request.GroupName})",
        });

        var branch = string.IsNullOrWhiteSpace(repo.DefaultBranch) ? "main" : repo.DefaultBranch;

        // Первый коммит без родителей: дерево со всеми файлами + создание ветки.
        var files = RepositoryTemplate.BuildFiles(request.FullName, request.GroupName, request.CourseName);
        var newTree = new NewTree();
        foreach (var (path, content) in files)
        {
            newTree.Tree.Add(new NewTreeItem
            {
                Path = path,
                Mode = "100644",
                Type = TreeType.Blob,
                Content = content,
            });
        }

        var tree = await client.Git.Tree.Create(org, request.Name, newTree);
        var commit = await client.Git.Commit.Create(org, request.Name, new NewCommit("Инициализация структуры репозитория", tree.Sha));
        await client.Git.Reference.Create(org, request.Name, new NewReference($"refs/heads/{branch}", commit.Sha));

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
}
