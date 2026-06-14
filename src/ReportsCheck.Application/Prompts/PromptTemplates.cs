namespace ReportsCheck.Application.Prompts;

/// <summary>
/// Три шаблона промптов, загружаемые при старте из server/prompts-аналога
/// (Web/Prompts/*.template). Регистрируется как singleton.
/// </summary>
public class PromptTemplates
{
    public required string Standard { get; init; }
    public required string Multiple { get; init; }
    public required string Prev { get; init; }
}
