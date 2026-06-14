using ReportsCheck.Application.Prompts;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Infrastructure.Llm;

/// <summary>
/// Обработчик конкретного LLM-интерфейса. Порт ILlmProviderHandler.
/// </summary>
public interface ILlmProviderHandler
{
    Task<string> CompletionAsync(SplitPrompt prompt, Model model, CancellationToken cancellationToken);

    /// <summary>Бросает дружелюбное исключение для известных ошибок (иначе — без действия).</summary>
    void ProcessError(Exception error);
}

public interface ILlmProviderFactory
{
    ILlmProviderHandler Create(Domain.Enums.LlmInterface llmInterface);
}
