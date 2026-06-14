using ReportsCheck.Application.Prompts;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Application.Llm;

/// <summary>
/// Запрос к модели с повторными попытками. Порт LlmService.query.
/// </summary>
public interface ILlmService
{
    Task<string> QueryAsync(SplitPrompt prompt, Model model, CancellationToken cancellationToken = default);
}

/// <summary>
/// Запись сырого ответа модели в models_logs. Порт FileService.writeFile (узкое применение).
/// </summary>
public interface IModelResponseLogger
{
    void Write(string modelName, string content);
}
