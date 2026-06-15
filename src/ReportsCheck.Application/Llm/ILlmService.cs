using ReportsCheck.Application.Prompts;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Application.Llm;

/// <summary>
/// Ответ модели вместе с расходом токенов. <see cref="InputTokens"/> и
/// <see cref="OutputTokens"/> равны 0, если провайдер не вернул usage.
/// </summary>
public record LlmResult(string Content, int InputTokens, int OutputTokens);

/// <summary>
/// Запрос к модели с повторными попытками. Порт LlmService.query.
/// </summary>
public interface ILlmService
{
    Task<LlmResult> QueryAsync(SplitPrompt prompt, Model model, CancellationToken cancellationToken = default);
}

/// <summary>
/// Запись сырого ответа модели в models_logs. Порт FileService.writeFile (узкое применение).
/// </summary>
public interface IModelResponseLogger
{
    void Write(string modelName, string content);
}
