namespace ReportsCheck.Application.Prompts;

/// <summary>
/// Промпт, разделённый маркером @SPLIT на системную (доверенную) и
/// пользовательскую (недоверенную) части. Порт SplitPrompt.
/// </summary>
public record SplitPrompt(string System, string User);
