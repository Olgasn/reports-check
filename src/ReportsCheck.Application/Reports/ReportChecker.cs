using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ReportsCheck.Application.Checks;
using ReportsCheck.Application.Llm;
using ReportsCheck.Application.Notifications;
using ReportsCheck.Application.Prompts;
using ReportsCheck.Application.Reports.Models;
using ReportsCheck.Application.Security;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Interfaces;
using ReportsCheck.Domain.Security;

namespace ReportsCheck.Application.Reports;

/// <summary>
/// Проверка одного отчёта и сохранение результатов. Прямой порт ReportCheck.
/// Операции с БД выполняются в отдельных коротких scope, поэтому параллельные
/// (по сети) вызовы модели безопасны для EF Core. Upsert студента сериализован
/// семафором, чтобы исключить гонку при создании дубликатов.
/// </summary>
public class ReportChecker
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly INotificationService _notification;
    private readonly IPromptService _promptService;
    private readonly ILlmService _llmService;
    private readonly IModelResponseLogger _responseLogger;
    private readonly IModelResultExtractor _extractor;
    private readonly IPromptInjectionService _promptInjection;
    private readonly ILogger<ReportChecker> _logger;

    private static readonly SemaphoreSlim StudentUpsertLock = new(1, 1);

    public ReportChecker(
        IServiceScopeFactory scopeFactory,
        INotificationService notification,
        IPromptService promptService,
        ILlmService llmService,
        IModelResponseLogger responseLogger,
        IModelResultExtractor extractor,
        IPromptInjectionService promptInjection,
        ILogger<ReportChecker> logger)
    {
        _scopeFactory = scopeFactory;
        _notification = notification;
        _promptService = promptService;
        _llmService = llmService;
        _responseLogger = responseLogger;
        _extractor = extractor;
        _promptInjection = promptInjection;
        _logger = logger;
    }

    public async Task<CheckResult> CheckOneReportAsync(
        ParsedReport report,
        string task,
        string content,
        Model model,
        int groupId,
        bool checkPrev,
        int labId,
        CancellationToken cancellationToken = default)
    {
        var (student, studentStr, studentFound) = await ProcessStudentAsync(report, groupId, cancellationToken);

        _notification.ReportOneStarted(studentStr, model.Name, student.Id, labId);
        _logger.LogInformation("Начал провека отчета студента [{Student}] моделью [{Model}]", studentStr, model.Name);

        var securityAnalysis = _promptInjection.Analyze(report.Content);
        var basePrompt = _promptService.PreparePrompt(report.Content, task, content, securityAnalysis);
        var prompt = await PreparePromptAsync(basePrompt, checkPrev, studentFound?.Id, cancellationToken);

        var result = await _llmService.QueryAsync(prompt, model, cancellationToken);

        _responseLogger.Write(model.Name, result);

        _notification.ReportOneChecked(studentStr, model.Name, student.Id, labId);
        _logger.LogInformation("Отчет студента [{Student}] был проверен моделью [{Model}]", studentStr, model.Name);

        var resultDto = _extractor.Extract(result);
        var checkedResult = _promptInjection.MergeResultFields(resultDto, securityAnalysis);

        _promptInjection.AssertGeneratedReviewAllowed(checkedResult.Review, checkedResult.Advantages, checkedResult.Disadvantages);

        return new CheckResult
        {
            Student = student,
            Grade = checkedResult.Grade,
            Review = checkedResult.Review,
            Advantages = checkedResult.Advantages,
            Disadvantages = checkedResult.Disadvantages,
            PromptInjectionDetected = checkedResult.PromptInjectionDetected,
            PromptInjectionRisk = checkedResult.PromptInjectionRisk,
            PromptInjectionFragments = checkedResult.PromptInjectionFragments,
            SecurityComment = checkedResult.SecurityComment,
            Model = model,
            Answer = report.Content,
        };
    }

    private async Task<SplitPrompt> PreparePromptAsync(SplitPrompt prompt, bool usePrev, int? studentId, CancellationToken cancellationToken)
    {
        if (!usePrev || studentId is null)
        {
            return prompt;
        }

        await using var scope = _scopeFactory.CreateAsyncScope();
        var checkService = scope.ServiceProvider.GetRequiredService<ICheckService>();

        var prevCheck = await checkService.FindLastCheckAsync(studentId.Value, cancellationToken);

        if (prevCheck is null)
        {
            return prompt;
        }

        var fullText = string.IsNullOrEmpty(prompt.System) ? prompt.User : $"{prompt.System}\n{prompt.User}";
        var prevSecurity = _promptInjection.Analyze(prevCheck.Report);

        var newPrompt = _promptService.PreparePrevPrompt(
            new PrevPromptData(
                prevCheck.Review,
                prevCheck.Grade.ToString(),
                prevCheck.Advantages,
                prevCheck.Disadvantages,
                fullText,
                prevCheck.Report),
            prevSecurity);

        return new SplitPrompt(string.Empty, newPrompt);
    }

    private async Task<(Student student, string studentStr, Student? studentFound)> ProcessStudentAsync(
        ParsedReport report, int groupId, CancellationToken cancellationToken)
    {
        var studentStr = $"{report.Name} {report.Surname} {report.Middlename}";

        await StudentUpsertLock.WaitAsync(cancellationToken);
        try
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var students = scope.ServiceProvider.GetRequiredService<IRepository<Student>>();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            var studentFound = await students.FirstOrDefaultAsync(
                s => s.Name == report.Name && s.Surname == report.Surname && s.Middlename == report.Middlename,
                cancellationToken);

            if (studentFound is not null)
            {
                return (studentFound, studentStr, studentFound);
            }

            var created = new Student
            {
                Name = report.Name,
                Surname = report.Surname,
                Middlename = report.Middlename,
                GroupId = groupId,
            };

            await students.AddAsync(created, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return (created, studentStr, null);
        }
        finally
        {
            StudentUpsertLock.Release();
        }
    }

    /// <summary>
    /// Сохраняет результаты проверки в БД. Порт ReportCheck.createChecks.
    /// </summary>
    public async Task<List<Check>> CreateChecksAsync(IReadOnlyList<CheckResult> results, int modelId, int labId, CancellationToken cancellationToken)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var checks = scope.ServiceProvider.GetRequiredService<IRepository<Check>>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var created = new List<Check>();

        foreach (var result in results)
        {
            var check = new Check
            {
                Review = result.Review,
                Advantages = string.Join("\n", result.Advantages),
                Disadvantages = string.Join("\n", result.Disadvantages),
                StudentId = result.Student.Id,
                LabId = labId,
                ModelId = modelId,
                Grade = result.Grade,
                Report = result.Answer,
                PromptInjectionDetected = result.PromptInjectionDetected,
                PromptInjectionRisk = result.PromptInjectionRisk,
                PromptInjectionFragments = string.Join("\n", result.PromptInjectionFragments),
                SecurityComment = result.SecurityComment,
                Date = DateTime.UtcNow,
            };

            await checks.AddAsync(check, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            created.Add(check);
        }

        return created;
    }
}
