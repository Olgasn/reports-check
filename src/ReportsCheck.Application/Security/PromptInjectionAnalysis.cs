using ReportsCheck.Domain.Security;

namespace ReportsCheck.Application.Security;

/// <summary>
/// Результат детерминированного сканирования текста на инъекции промпта.
/// Порт PromptInjectionAnalysis из исходного проекта.
/// </summary>
public record PromptInjectionAnalysis
{
    public bool Detected { get; init; }
    public string RiskLevel { get; init; } = PromptInjectionRisk.None;
    public IReadOnlyList<string> Indicators { get; init; } = [];
    public IReadOnlyList<string> Fragments { get; init; } = [];

    public static PromptInjectionAnalysis Empty() => new();
}

/// <summary>
/// Поля результата проверки, относящиеся к безопасности. Реализуются как
/// разобранным ответом модели, так и итоговым результатом проверки —
/// позволяет обобщённо сливать данные сканера (mergeResultFields).
/// </summary>
public interface IPromptInjectionFields
{
    bool PromptInjectionDetected { get; set; }
    string PromptInjectionRisk { get; set; }
    List<string> PromptInjectionFragments { get; set; }
    string SecurityComment { get; set; }
}
