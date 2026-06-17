using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ReportsCheck.Application.Email;
using ReportsCheck.Application.GitHub;
using ReportsCheck.Application.Notifications;
using ReportsCheck.Application.Provisioning;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Infrastructure.Persistence;

namespace ReportsCheck.Infrastructure.BackgroundJobs;

/// <summary>
/// Фоновая обработка заданий по созданию GitHub-репозиториев и рассылке приглашений.
/// По образцу <see cref="ReportCheckWorker"/>: каждое задание выполняется в своём DI-scope.
/// </summary>
public class ProvisioningWorker : BackgroundService
{
    private readonly IProvisioningQueue _queue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly INotificationService _notification;
    private readonly ILogger<ProvisioningWorker> _logger;

    public ProvisioningWorker(
        IProvisioningQueue queue,
        IServiceScopeFactory scopeFactory,
        INotificationService notification,
        ILogger<ProvisioningWorker> logger)
    {
        _queue = queue;
        _scopeFactory = scopeFactory;
        _notification = notification;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            ProvisioningJob job;
            try
            {
                job = await _queue.DequeueAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }

            await ProcessAsync(job, stoppingToken);
        }
    }

    private async Task ProcessAsync(ProvisioningJob job, CancellationToken cancellationToken)
    {
        try
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            if (job.Kind == ProvisioningJobKind.CreateRepos)
            {
                var github = scope.ServiceProvider.GetRequiredService<IGitHubRepositoryService>();
                await CreateReposAsync(db, github, job, cancellationToken);
            }
            else
            {
                var email = scope.ServiceProvider.GetRequiredService<IEmailService>();
                await SendInvitationsAsync(db, email, job, cancellationToken);
            }

            _notification.ProvisioningDone(job.CourseId, job.GroupId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка задания provisioning ({Kind}) для курса {CourseId}, группы {GroupId}", job.Kind, job.CourseId, job.GroupId);
            _notification.ProvisioningFailed(job.CourseId, job.GroupId, ex.Message);
        }
    }

    private async Task CreateReposAsync(AppDbContext db, IGitHubRepositoryService github, ProvisioningJob job, CancellationToken cancellationToken)
    {
        var course = await db.Courses.FirstOrDefaultAsync(c => c.Id == job.CourseId, cancellationToken)
            ?? throw new InvalidOperationException("Дисциплина не найдена.");
        var group = await db.Groups.FirstOrDefaultAsync(g => g.Id == job.GroupId, cancellationToken)
            ?? throw new InvalidOperationException("Группа не найдена.");

        var students = await LoadStudentsAsync(db, job, cancellationToken);

        foreach (var student in students)
        {
            var fullName = FullName(student);
            _notification.ProvisioningStudent(fullName, "started", job.CourseId, job.GroupId);

            var existing = await db.StudentRepositories
                .FirstOrDefaultAsync(r => r.StudentId == student.Id && r.CourseId == job.CourseId, cancellationToken);

            if (existing is { Status: "Created" })
            {
                _notification.ProvisioningStudent(fullName, "skipped", job.CourseId, job.GroupId);
                continue;
            }

            // Перезапуск после неудачи: убираем старую запись со статусом «Failed».
            if (existing is not null)
            {
                db.StudentRepositories.Remove(existing);
                await db.SaveChangesAsync(cancellationToken);
            }

            var identifier = RepositoryNaming.EmailLocalPart(student.Email);
            var name = RepositoryNaming.Build(group.Name, course.Abbreviation, identifier);

            try
            {
                var result = await github.CreateRepositoryAsync(
                    new GitHubRepoRequest(name, fullName, group.Name, course.Name, student.GitHubUsername),
                    cancellationToken);

                db.StudentRepositories.Add(new StudentRepository
                {
                    Name = name,
                    Url = result.Url,
                    Status = "Created",
                    StudentId = student.Id,
                    CourseId = job.CourseId,
                    CreatedAt = DateTime.UtcNow,
                });
                await db.SaveChangesAsync(cancellationToken);

                _notification.ProvisioningStudent(fullName, "created", job.CourseId, job.GroupId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Не удалось создать репозиторий «{Name}» для студента {Student}", name, fullName);

                db.StudentRepositories.Add(new StudentRepository
                {
                    Name = name,
                    Url = string.Empty,
                    Status = "Failed",
                    Error = ex.Message,
                    StudentId = student.Id,
                    CourseId = job.CourseId,
                    CreatedAt = DateTime.UtcNow,
                });
                await db.SaveChangesAsync(cancellationToken);

                _notification.ProvisioningStudent(fullName, "failed", job.CourseId, job.GroupId);
            }
        }
    }

    private async Task SendInvitationsAsync(AppDbContext db, IEmailService email, ProvisioningJob job, CancellationToken cancellationToken)
    {
        var course = await db.Courses.FirstOrDefaultAsync(c => c.Id == job.CourseId, cancellationToken)
            ?? throw new InvalidOperationException("Дисциплина не найдена.");

        var query = db.StudentRepositories
            .Include(r => r.Student)
            .Where(r => r.CourseId == job.CourseId && r.Student.GroupId == job.GroupId && r.Status == "Created");

        if (job.StudentIds.Count > 0)
        {
            query = query.Where(r => job.StudentIds.Contains(r.StudentId));
        }

        var repositories = await query.ToListAsync(cancellationToken);

        foreach (var repo in repositories)
        {
            var fullName = FullName(repo.Student);
            _notification.ProvisioningStudent(fullName, "started", job.CourseId, job.GroupId);

            if (string.IsNullOrWhiteSpace(repo.Student.Email))
            {
                _notification.ProvisioningStudent(fullName, "skipped", job.CourseId, job.GroupId);
                continue;
            }

            try
            {
                var (subject, body) = BuildInvitation(fullName, course.Name, repo.Url);
                await email.SendEmailAsync(repo.Student.Email, subject, body, cancellationToken);

                repo.InvitationEmailed = true;
                repo.EmailedAt = DateTime.UtcNow;
                await db.SaveChangesAsync(cancellationToken);

                _notification.ProvisioningStudent(fullName, "emailed", job.CourseId, job.GroupId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Не удалось отправить приглашение студенту {Student}", fullName);
                _notification.ProvisioningStudent(fullName, "failed", job.CourseId, job.GroupId);
            }
        }
    }

    private static async Task<List<Student>> LoadStudentsAsync(AppDbContext db, ProvisioningJob job, CancellationToken cancellationToken)
    {
        var query = db.Students.Where(s => s.GroupId == job.GroupId);
        if (job.StudentIds.Count > 0)
        {
            query = query.Where(s => job.StudentIds.Contains(s.Id));
        }

        return await query.OrderBy(s => s.Surname).ThenBy(s => s.Name).ToListAsync(cancellationToken);
    }

    private static string FullName(Student s) =>
        string.Join(' ', new[] { s.Surname, s.Name, s.Middlename }.Where(p => !string.IsNullOrWhiteSpace(p) && p != "-"));

    private static (string Subject, string Body) BuildInvitation(string fullName, string courseName, string repoUrl)
    {
        var subject = $"Приглашение в репозиторий по дисциплине «{courseName}»";
        var body = $"""
            <h3>Здравствуйте, {fullName}!</h3>
            <p>Для вас создан учебный репозиторий по дисциплине <b>{courseName}</b>.</p>
            <p>Ссылка на репозиторий: <a href="{repoUrl}">{repoUrl}</a></p>
            <p>Вам отправлено приглашение стать администратором репозитория — примите его на GitHub.
            В репозитории подготовлена структура из 6 лабораторных работ.</p>
            """;
        return (subject, body);
    }
}
