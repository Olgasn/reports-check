using Microsoft.Extensions.Logging;
using ReportsCheck.Application.Files;
using ReportsCheck.Application.Llm;
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
        _logger = logger;
    }

    private sealed record ReviewData(Student Student, List<ModelCheckResultSummary> Result, string Answer);

    public async Task<IReadOnlyList<Check>> CheckAsync(ReportCheckJob job, CancellationToken cancellationToken = default)
    {
        var reviewModelId = job.ModelsId.Count > 0 ? job.ModelsId[^1] : throw new InvalidOperationException("Incorrect data");

        var lab = await _dataProvider.GetLabWithCoursePromptAsync(job.LabId, cancellationToken);
        var models = await _dataProvider.GetModelsWithRelationsAsync(job.ModelsId.Take(job.ModelsId.Count - 1).ToList(), cancellationToken);
        var modelReview = await _dataProvider.GetModelWithRelationsAsync(reviewModelId, cancellationToken);

        var content = lab.Course.Prompt?.Content ?? string.Empty;
        var task = lab.Content;
        var reportsData = await GetReportsDataAsync(job, cancellationToken);

        var batchTasks = models.Select(model => RunModelBatchAsync(model, reportsData, task, content, job, lab.Id, cancellationToken)).ToList();
        var settled = await Task.WhenAll(batchTasks);

        var fulfilled = settled.Where(b => b.Success).Select(b => b.Results!).ToList();
        var reviewData = PrepareMultipleData(fulfilled);

        var combineTasks = reviewData.Select(data => CombineCheckResultAsync(data, modelReview, task, content, cancellationToken)).ToList();
        var combined = await Task.WhenAll(combineTasks);

        return await _reportChecker.CreateChecksAsync(combined, modelReview.Id, lab.Id, cancellationToken);
    }

    private async Task<(bool Success, List<CheckResult>? Results)> RunModelBatchAsync(
        Model model, IReadOnlyList<ParsedReport> reports, string task, string content, ReportCheckJob job, int labId, CancellationToken cancellationToken)
    {
        try
        {
            var checkTasks = reports.Select(report =>
                _reportChecker.CheckOneReportAsync(report, task, content, model, job.GroupId, job.CheckPrev, labId, cancellationToken)).ToList();
            var results = await Task.WhenAll(checkTasks);
            return (true, results.ToList());
        }
        catch
        {
            return (false, null);
        }
    }

    private static List<ReviewData> PrepareMultipleData(List<List<CheckResult>> results)
    {
        var reviewData = new List<ReviewData>();

        if (results.Count == 0 || results[0].Count == 0)
        {
            return reviewData;
        }

        for (var i = 0; i < results[0].Count; i++)
        {
            var summaries = new List<ModelCheckResultSummary>();
            var answer = results[0][i].Answer;

            foreach (var batch in results)
            {
                var r = batch[i];
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
            }

            reviewData.Add(new ReviewData(results[0][i].Student, summaries, answer));
        }

        return reviewData;
    }

    private async Task<CheckResult> CombineCheckResultAsync(ReviewData data, Model modelReview, string task, string content, CancellationToken cancellationToken)
    {
        var studentStr = $"{data.Student.Name} {data.Student.Surname} {data.Student.Middlename}";
        var securityAnalysis = _promptInjection.Analyze(data.Answer);

        _logger.LogInformation("Началось сведение ответов для студента [{Student}] моделью [{Model}]", studentStr, modelReview.Name);

        var prompt = _promptService.PrepareMultiplePrompt(task, data.Answer, content, data.Result.Cast<object>().ToList(), securityAnalysis);
        var response = await _llmService.QueryAsync(prompt, modelReview, cancellationToken);

        _responseLogger.Write(modelReview.Name, response);

        _logger.LogInformation("Закончилось сведение ответов для студента [{Student}] моделью [{Model}]", studentStr, modelReview.Name);

        var resultDto = _extractor.Extract(response);
        var checkedResult = _promptInjection.MergeResultFields(resultDto, securityAnalysis);

        _promptInjection.AssertGeneratedReviewAllowed(checkedResult.Review, checkedResult.Advantages, checkedResult.Disadvantages);

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
