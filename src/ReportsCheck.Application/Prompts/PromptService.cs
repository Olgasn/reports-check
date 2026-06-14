using System.Text.Json;
using System.Text.RegularExpressions;
using ReportsCheck.Application.Security;

namespace ReportsCheck.Application.Prompts;

/// <summary>
/// Сборка промптов из шаблонов. Прямой порт PromptService (часть, отвечающая
/// за подстановку плейсхолдеров, оборачивание недоверенного контента и
/// разделение по @SPLIT). CRUD по сущности Prompt вынесен в feature-хэндлеры.
/// </summary>
public class PromptService : IPromptService
{
    private readonly PromptTemplates _templates;
    private readonly IPromptInjectionService _promptInjection;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    public PromptService(PromptTemplates templates, IPromptInjectionService promptInjection)
    {
        _templates = templates;
        _promptInjection = promptInjection;
    }

    public SplitPrompt PreparePrompt(string answer, string task, string content, PromptInjectionAnalysis? securityAnalysis = null)
    {
        var template = _templates.Standard;
        template = ReplaceFirst(template, "@SECURITY_CONTEXT", FormatSecurityContext(securityAnalysis));
        template = ReplaceFirst(template, "@PROMPT_TEXT", content);
        template = ReplaceFirst(template, "@LAB_TASK", task);
        template = ReplaceFirst(template, "@STUDENT_ANSWER", BuildUntrustedBlock("student_report", answer));

        return SplitAtMarker(template);
    }

    public SplitPrompt PrepareMultiplePrompt(string task, string answer, string content, IReadOnlyList<object> checks, PromptInjectionAnalysis? securityAnalysis = null)
    {
        var checksJson = JsonSerializer.Serialize(checks, JsonOptions);
        var template = _templates.Multiple;
        template = ReplaceFirst(template, "@SECURITY_CONTEXT", FormatSecurityContext(securityAnalysis));
        template = ReplaceFirst(template, "@PROMPT_TEXT", content);
        template = ReplaceFirst(template, "@LAB_TASK", task);
        template = ReplaceFirst(template, "@STUDENT_ANSWER", BuildUntrustedBlock("student_report", answer));
        template = ReplaceFirst(template, "@MODELS_CHECK_RESULT", BuildUntrustedBlock("model_check_results", checksJson));

        return SplitAtMarker(template);
    }

    public string PreparePrevPrompt(PrevPromptData data, PromptInjectionAnalysis? securityAnalysis = null)
    {
        var template = _templates.Prev;
        template = ReplaceFirst(template, "@PROMPT", data.PromptTxt);
        template = ReplaceFirst(template, "@SECURITY_CONTEXT", FormatSecurityContext(securityAnalysis));
        template = ReplaceFirst(template, "@PREV_REVIEW", data.Review);
        template = ReplaceFirst(template, "@PREV_GRADE", data.Grade);
        template = ReplaceFirst(template, "@PREV_ADVANTAGES", data.Advantages);
        template = ReplaceFirst(template, "@PREV_DISADVANTAGES", data.Disadvantages);
        template = ReplaceFirst(template, "@PREV_REPORT", BuildUntrustedBlock("previous_report", data.Report));

        return template;
    }

    public string BuildUntrustedBlock(string label, string content)
    {
        var tag = $"UNTRUSTED_{label.ToUpperInvariant()}";
        var sanitized = SanitizeUntrustedText(content, tag);

        return $"<{tag}>\n{sanitized}\n</{tag}>";
    }

    private static string SanitizeUntrustedText(string content, string? tag = null)
    {
        var sanitized = content
            .Replace("@SPLIT", "[REMOVED_SPLIT_MARKER]");
        sanitized = Regex.Replace(sanitized, @"<\/?JSON>", "[REMOVED_JSON_MARKER]", RegexOptions.IgnoreCase);

        if (tag is not null)
        {
            sanitized = Regex.Replace(sanitized, $@"<\s*/?\s*{tag}\s*>", $"[REMOVED_{tag}_MARKER]", RegexOptions.IgnoreCase);
        }

        return sanitized;
    }

    private static SplitPrompt SplitAtMarker(string template)
    {
        var parts = template.Split("@SPLIT");

        if (parts.Length < 2)
        {
            return new SplitPrompt(string.Empty, template);
        }

        var system = parts[0].TrimEnd();
        var user = Regex.Replace(parts[1], @"^\r?\n", string.Empty);

        return new SplitPrompt(system, user);
    }

    private string FormatSecurityContext(PromptInjectionAnalysis? analysis) =>
        _promptInjection.FormatSecurityContext(analysis ?? PromptInjectionAnalysis.Empty());

    /// <summary>
    /// Заменяет только первое вхождение — повторяет семантику String.replace(string, string) в JS.
    /// </summary>
    private static string ReplaceFirst(string text, string search, string replacement)
    {
        var index = text.IndexOf(search, StringComparison.Ordinal);
        return index < 0 ? text : string.Concat(text.AsSpan(0, index), replacement, text.AsSpan(index + search.Length));
    }
}
