using ReportsCheck.Application.Security;

namespace ReportsCheck.Application.Prompts;

public interface IPromptService
{
    SplitPrompt PreparePrompt(string answer, string task, string content, PromptInjectionAnalysis? securityAnalysis = null);

    SplitPrompt PrepareMultiplePrompt(string task, string answer, string content, IReadOnlyList<object> checks, PromptInjectionAnalysis? securityAnalysis = null);

    string PreparePrevPrompt(PrevPromptData data, PromptInjectionAnalysis? securityAnalysis = null);

    string BuildUntrustedBlock(string label, string content);
}

public record PrevPromptData(
    string Review,
    string Grade,
    string Advantages,
    string Disadvantages,
    string PromptTxt,
    string Report);
