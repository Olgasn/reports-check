using Microsoft.Extensions.Logging;
using ReportsCheck.Application.Files;
using ReportsCheck.Application.Llm;
using ReportsCheck.Application.Notifications;
using ReportsCheck.Application.Prompts;
using ReportsCheck.Application.Reports.Models;
using ReportsCheck.Application.Security;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Application.Reports.Strategies;

/// <summary>
/// Все модели проверяют каждый отчёт, затем последняя модель в списке сводит
/// результаты в итоговую рецензию. Порт MultipleModelStrategy.
/// </summary>
public class MultipleModelStrategy : IReportStrategy
{
    private readonly ReportChecker _reportChecker;
    private readonly IReportDataProvider _dataProvider;
    private readonly IFileParsingService _fileParsing;
    private readonly ILlmService _llmService;
    private readonly IPromptService _promptService;
    private readonly IModelResponseLogger _responseLogger;
    private readonly IModelResultExtractor _extractor;
    private readonly IPromptInjectionService _promptInjection;
    private readonly INotificationService _notification;
    private readonly ILogger<MultipleModelStrategy> _logger;

    public MultipleModelStrategy(
        ReportChecker reportChecker,
        IReportDataProvider dataProvider,
        IFileParsingService fileParsing,
        ILlmService llmService,
        IPromptService promptService,
        IModelResponseLogger responseLogger,
        IModelResultExtractor extractor,
        IPromptInjectionService promptInjection,
        INotificationService notification,
        ILogger<MultipleModelStrategy> logger)
    {
        _reportChecker = reportChecker;
        _dataProvider = dataProvider;
        _fileParsing = fileParsing;
        _llmService = llmService;
        _promptService = promptService;
        _responseLogger = responseLogger;
        _extractor = extractor;
        _promptInjection = promptInjection;
        _notification = notification;
        _logger = logger;
    }

    // InputTokens/OutputTokens/Cost — накопленные суммы по всем промежуточным моделям для этого студента.
    internal sealed record ReviewData(
        Student Student, List<ModelCheckResultSummary> Result, string Answer,
        int InputTokens, int OutputTokens, decimal Cost);

    public async Task<IReadOnlyList<Check>> CheckAsync(ReportCheckJob job, CancellationToken cancellationToken = default)
    {
        var reviewModelId = job.ModelsId.Count > 0 ? job.ModelsId[^1] : throw new InvalidOperationException("Incorrect data");

        var lab = await _dataProvider.GetLabWithCoursePromptAsync(job.LabId, cancellationToken);
        var models = await _dataProvider.GetModelsWithRelationsAsync(job.ModelsId.Take(job.ModelsId.Count - 1).ToList(), cancellationToken);
        var modelReview = await _dataProvider.GetModelWithRelationsAsync(reviewModelId, cancellationToken);

        var content = lab.Course.Prompt?.Content ?? string.Empty;
        var task = lab.Content;
        var reportsData = await GetReportsDataAsync(job, cancellationToken);

        // Каждая модель проверяет все отчёты; результат выровнен по индексу отчёта.
        // null означает, что модель не справилась с конкретным отчётом — сбой одного
        // отчёта (или модели) не должен ронять весь батч и срывать сведение.
        var batchTasks = models.Select(model => RunModelBatchAsync(model, reportsData, task, content, job, lab.Id, cancellationToken)).ToList();
        var batches = await Task.WhenAll(batchTasks);

        var reviewData = PrepareMultipleData(batches);

        var combineTasks = reviewData.Select(data => CombineCheckResultSafelyAsync(data, modelReview, task, content, lab.Id, cancellationToken)).ToList();
        var combined = (await Task.WhenAll(combineTasks)).Where(r => r is not null).Select(r => r!).ToList();

        return await _reportChecker.CreateChecksAsync(combined, modelReview.Id, lab.Id, cancellationToken);
    }

    // Возвращает результаты, выровненные по индексу отчёта: null — отчёт не удалось проверить этой моделью.
    private async Task<CheckResult?[]> RunModelBatchAsync(
        Model model, IReadOnlyList<ParsedReport> reports, string task, string content, ReportCheckJob job, int labId, CancellationToken cancellationToken)
    {
        var checkTasks = reports.Select(report =>
            CheckReportSafelyAsync(report, task, content, model, job, labId, cancellationToken)).ToList();

        return await Task.WhenAll(checkTasks);
    }

    private async Task<CheckResult?> CheckReportSafelyAsync(
        ParsedReport report, string task, string content, Model model, ReportCheckJob job, int labId, CancellationToken cancellationToken)
    {
        try
        {
            return await _reportChecker.CheckOneReportAsync(report, task, content, model, job.GroupId, job.CheckPrev, labId, cancellationToken);
        }
        catch (Exception ex)
        {
            var studentStr = $"{report.Name} {report.Surname} {report.Middlename}";
            _notification.ReportOneFailed(studentStr, model.Name, 0, labId);
            _logger.LogError(ex, "Не удалось проверить отчёт студента [{Student}] моделью [{Model}]", studentStr, model.Name);
            return null;
        }
    }

    internal static List<ReviewData> PrepareMultipleData(IReadOnlyList<CheckResult?[]> batches)
    {
        var reviewData = new List<ReviewData>();

        if (batches.Count == 0)
        {
            return reviewData;
        }

        var reportCount = batches[0].Length;

        for (var i = 0; i < reportCount; i++)
        {
            // Сводки только тех моделей, что успешно проверили отчёт i.
            var succeeded = batches
                .Where(b => i < b.Length && b[i] is not null)
                .Select(b => b[i]!)
                .ToList();

            // Ни одна модель не справилась с отчётом — сводить нечего (сбой уже отправлен в уведомления).
            if (succeeded.Count == 0)
            {
                continue;
            }

            var summaries = new List<ModelCheckResultSummary>();
            var inputTokens = 0;
            var outputTokens = 0;
            var cost = 0m;

            foreach (var r in succeeded)
            {
                summaries.Add(new ModelCheckResultSummary
                {
                    ModelName = r.Model.Name,
                    Review = r.Review,
                    Grade = r.Grade,
                    Advantages = r.Advantages,
                    Disadvantages = r.Disadvantages,
                    PromptInjectionDetected = r.PromptInjectionDetected,
                    PromptInjectionRisk = r.PromptInjectionRisk,
                    PromptInjectionFragments = r.PromptInjectionFragments,
                    SecurityComment = r.SecurityComment,
                });

                inputTokens += r.InputTokens;
                outputTokens += r.OutputTokens;
                cost += r.Cost;
            }

            var first = succeeded[0];
            reviewData.Add(new ReviewData(first.Student, summaries, first.Answer, inputTokens, outputTokens, cost));
        }

        return reviewData;
    }

    private async Task<CheckResult?> CombineCheckResultSafelyAsync(
        ReviewData data, Model modelReview, string task, string content, int labId, CancellationToken cancellationToken)
    {
        var studentStr = $"{data.Student.Name} {data.Student.Surname} {data.Student.Middlename}";

        _notification.ReportOneStarted(studentStr, modelReview.Name, data.Student.Id, labId);
        _logger.LogInformation("Началось сведение ответов для студента [{Student}] моделью [{Model}]", studentStr, modelReview.Name);

        try
        {
            var result = await CombineCheckResultAsync(data, modelReview, task, content, cancellationToken);

            _notification.ReportOneChecked(studentStr, modelReview.Name, data.Student.Id, labId);
            _logger.LogInformation("Закончилось сведение ответов для студента [{Student}] моделью [{Model}]", studentStr, modelReview.Name);

            return result;
        }
        catch (Exception ex)
        {
            _notification.ReportOneFailed(studentStr, modelReview.Name, data.Student.Id, labId);
            _logger.LogError(ex, "Не удалось свести ответы для студента [{Student}] моделью [{Model}]", studentStr, modelReview.Name);
            return null;
        }
    }

    private async Task<CheckResult> CombineCheckResultAsync(ReviewData data, Model modelReview, string task, string content, CancellationToken cancellationToken)
    {
        var securityAnalysis = _promptInjection.Analyze(data.Answer);

        var prompt = _promptService.PrepareMultiplePrompt(task, data.Answer, content, data.Result.Cast<object>().ToList(), securityAnalysis);
        var response = await _llmService.QueryAsync(prompt, modelReview, cancellationToken);

        _responseLogger.Write(modelReview.Name, response.Content);

        var resultDto = _extractor.Extract(response.Content);
        var checkedResult = _promptInjection.MergeResultFields(resultDto, securityAnalysis);

        _promptInjection.AssertGeneratedReviewAllowed(checkedResult.Review, checkedResult.Advantages, checkedResult.Disadvantages);

        // Итоговый чек несёт суммарный расход: промежуточные модели + вызов агрегатора.
        var reviewCost = LlmCost.Compute(modelReview, response.InputTokens, response.OutputTokens);

        return new CheckResult
        {
            Student = data.Student,
            Grade = checkedResult.Grade,
            Review = checkedResult.Review,
            Advantages = checkedResult.Advantages,
            Disadvantages = checkedResult.Disadvantages,
            PromptInjectionDetected = checkedResult.PromptInjectionDetected,
            PromptInjectionRisk = checkedResult.PromptInjectionRisk,
            PromptInjectionFragments = checkedResult.PromptInjectionFragments,
            SecurityComment = checkedResult.SecurityComment,
            Model = modelReview,
            Answer = data.Answer,
            InputTokens = data.InputTokens + response.InputTokens,
            OutputTokens = data.OutputTokens + response.OutputTokens,
            Cost = data.Cost + reviewCost,
        };
    }

    private async Task<IReadOnlyList<ParsedReport>> GetReportsDataAsync(ReportCheckJob job, CancellationToken cancellationToken)
    {
        var data = await ResolveReportsAsync(job, cancellationToken);

        return job.StudentsId.Count > 0
            ? data.Where(rp => job.StudentsId.Any(st => ReportStudentMatch.IsSimilar(rp, st))).ToList()
            : data;
    }

    private async Task<IReadOnlyList<ParsedReport>> ResolveReportsAsync(ReportCheckJob job, CancellationToken cancellationToken)
    {
        if (job.ReportsZip is not null)
        {
            return await _fileParsing.ParseArchiveAsync(job.ReportsZip.Content, cancellationToken);
        }

        if (job.ReportFile is not null)
        {
            var student = job.StudentsId.Count > 0 ? job.StudentsId[0] : null;
            return await _fileParsing.ParseSingleReportAsync(job.ReportFile.FileName, job.ReportFile.Content, student, cancellationToken);
        }

        throw new InvalidOperationException("Не переданы файлы отчета для проверки");
    }
}
