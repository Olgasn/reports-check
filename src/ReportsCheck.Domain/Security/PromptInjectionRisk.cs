namespace ReportsCheck.Domain.Security;

/// <summary>
/// Уровни риска инъекции промпта. Хранятся и сериализуются как строки
/// ('none' | 'low' | 'medium' | 'high'), как в исходном проекте.
/// </summary>
public static class PromptInjectionRisk
{
    public const string None = "none";
    public const string Low = "low";
    public const string Medium = "medium";
    public const string High = "high";

    private static readonly Dictionary<string, int> Order = new()
    {
        [None] = 0,
        [Low] = 1,
        [Medium] = 2,
        [High] = 3,
    };

    public static int Rank(string? level) =>
        level is not null && Order.TryGetValue(level, out var rank) ? rank : 0;

    public static string Max(string? current, string? next) =>
        Rank(next) > Rank(current) ? (next ?? None) : (current ?? None);
}
