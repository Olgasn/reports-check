using System.Text.Json;
using System.Text.RegularExpressions;
using ReportsCheck.Domain.Security;

namespace ReportsCheck.Application.Security;

/// <summary>
/// Детерминированный сканер инъекций промпта. Прямой порт
/// PromptInjectionService из исходного NestJS-проекта.
/// </summary>
public class PromptInjectionService : IPromptInjectionService
{
    private const RegexOptions Options = RegexOptions.IgnoreCase | RegexOptions.CultureInvariant;

    private sealed record InjectionPattern(string Indicator, Regex Regex, string RiskLevel);

    private readonly InjectionPattern[] _patterns =
    [
        new("ignore-previous-instructions",
            new Regex(@"(ignore|disregard|forget)\s+(all\s+)?(previous|prior|above)\s+instructions", Options),
            PromptInjectionRisk.High),
        new("change-assistant-role",
            new Regex(@"(you are now|act as|developer message|system prompt|system message)", Options),
            PromptInjectionRisk.High),
        new("force-positive-grade",
            new Regex(@"(поставь|выставь|дай|верни)\s+(10|десять|максимальн|положительн|отличн)", Options),
            PromptInjectionRisk.High),
        new("skip-check",
            new Regex(@"(не\s+проверяй|пропусти\s+проверку|skip\s+(the\s+)?check|do\s+not\s+check)", Options),
            PromptInjectionRisk.High),
        new("force-output",
            new Regex(@"(верни\s+только|return\s+only|respond\s+only|напиши\s+только)", Options),
            PromptInjectionRisk.Medium),
        new("hide-errors",
            new Regex(@"(скрой\s+ошибк|не\s+указывай\s+ошибк|hide\s+errors|do\s+not\s+mention\s+errors)", Options),
            PromptInjectionRisk.High),
        new("structured-output-tampering",
            new Regex(@"<\/?JSON>|@SPLIT|<\/?UNTRUSTED_[A-Z_]+>", Options),
            PromptInjectionRisk.Medium),
    ];

    private static readonly string[] ForbiddenMarkers =
    [
        "проверка пропущена",
        "пропускаю проверку",
        "по просьбе студента",
        "ставлю 10 по просьбе",
        "skip the check",
        "as requested by the student",
        "give full credit",
    ];

    public PromptInjectionAnalysis Analyze(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return PromptInjectionAnalysis.Empty();
        }

        var indicators = new List<string>();
        var fragments = new List<string>();
        var riskLevel = PromptInjectionRisk.None;

        foreach (var pattern in _patterns)
        {
            var match = pattern.Regex.Match(text);

            if (!match.Success)
            {
                continue;
            }

            indicators.Add(pattern.Indicator);
            fragments.Add(ExtractFragment(text, match.Index, match.Length));
            riskLevel = PromptInjectionRisk.Max(riskLevel, pattern.RiskLevel);
        }

        return new PromptInjectionAnalysis
        {
            Detected = indicators.Count > 0,
            RiskLevel = riskLevel,
            Indicators = Unique(indicators),
            Fragments = Unique(fragments),
        };
    }

    public T MergeResultFields<T>(T result, PromptInjectionAnalysis analysis) where T : IPromptInjectionFields
    {
        var detected = result.PromptInjectionDetected || analysis.Detected;
        var risk = PromptInjectionRisk.Max(result.PromptInjectionRisk ?? PromptInjectionRisk.None, analysis.RiskLevel);
        var fragments = Unique([.. result.PromptInjectionFragments ?? [], .. analysis.Fragments]);
        var securityComment = !string.IsNullOrEmpty(result.SecurityComment)
            ? result.SecurityComment
            : (detected ? "Potential prompt injection was detected in untrusted report content." : string.Empty);

        result.PromptInjectionDetected = detected;
        result.PromptInjectionRisk = risk;
        result.PromptInjectionFragments = [.. fragments];
        result.SecurityComment = securityComment;

        return result;
    }

    public void AssertGeneratedReviewAllowed(string? review, IEnumerable<string>? advantages, IEnumerable<string>? disadvantages)
    {
        var parts = new List<string> { review ?? string.Empty };
        parts.AddRange(advantages ?? []);
        parts.AddRange(disadvantages ?? []);

        var text = string.Join("\n", parts).ToLowerInvariant();

        if (ForbiddenMarkers.Any(marker => text.Contains(marker, StringComparison.Ordinal)))
        {
            throw new InvalidOperationException("Model response appears to follow a prompt injection instruction");
        }
    }

    public string FormatSecurityContext(PromptInjectionAnalysis analysis)
    {
        var payload = new
        {
            promptInjectionDetected = analysis.Detected,
            promptInjectionRisk = analysis.RiskLevel,
            indicators = analysis.Indicators,
            suspiciousFragments = analysis.Fragments,
        };

        return JsonSerializer.Serialize(payload, new JsonSerializerOptions
        {
            WriteIndented = true,
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        });
    }

    private static string ExtractFragment(string text, int index, int length)
    {
        const int padding = 80;
        var start = Math.Max(0, index - padding);
        var end = Math.Min(text.Length, index + length + padding);
        var slice = text[start..end];

        return Regex.Replace(slice, @"\s+", " ").Trim();
    }

    private static List<string> Unique(IEnumerable<string> items)
    {
        var seen = new HashSet<string>();
        var result = new List<string>();

        foreach (var item in items)
        {
            if (!string.IsNullOrEmpty(item) && seen.Add(item))
            {
                result.Add(item);
            }
        }

        return result;
    }
}
