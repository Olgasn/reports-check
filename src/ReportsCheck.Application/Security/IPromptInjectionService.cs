namespace ReportsCheck.Application.Security;

public interface IPromptInjectionService
{
    PromptInjectionAnalysis Analyze(string? text);

    T MergeResultFields<T>(T result, PromptInjectionAnalysis analysis) where T : IPromptInjectionFields;

    void AssertGeneratedReviewAllowed(string? review, IEnumerable<string>? advantages, IEnumerable<string>? disadvantages);

    string FormatSecurityContext(PromptInjectionAnalysis analysis);
}
