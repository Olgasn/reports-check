using Microsoft.Extensions.Logging;
using ReportsCheck.Application.Llm;
using ReportsCheck.Application.Prompts;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Infrastructure.Llm;

/// <summary>
/// Запрос к модели с повторами. Прямой порт LlmService.query.
/// </summary>
public class SemanticKernelLlmService : ILlmService
{
    private readonly ILlmProviderFactory _factory;
    private readonly ILogger<SemanticKernelLlmService> _logger;

    public SemanticKernelLlmService(ILlmProviderFactory factory, ILogger<SemanticKernelLlmService> logger)
    {
        _factory = factory;
        _logger = logger;
    }

    public async Task<string> QueryAsync(SplitPrompt prompt, Model model, CancellationToken cancellationToken = default)
    {
        var provider = _factory.Create(model.LlmInterface);

        for (var i = 1; i <= model.MaxRetries; i++)
        {
            await Task.Delay(model.QueryDelay, cancellationToken);

            try
            {
                var result = await provider.CompletionAsync(prompt, model, cancellationToken);

                if (string.IsNullOrEmpty(result))
                {
                    _logger.LogWarning("Пустой ответ от модели [{Model}]. Выполнение повторного запроса", model.Name);
                    await Task.Delay(model.ErrorDelay, cancellationToken);
                    continue;
                }

                return result;
            }
            catch (Exception error)
            {
                // ProcessError бросает исключение для известных ошибок (например, 400) — повтор прекращается.
                provider.ProcessError(error);

                _logger.LogWarning(error, "Ошибка при обращении к модели [{Model}]. Выполнение повторного запроса", model.Name);
                await Task.Delay(model.ErrorDelay, cancellationToken);
            }
        }

        _logger.LogWarning("Превышено максимальное количество запросов к [{Model}]", model.Name);
        throw new InvalidOperationException("Не получилось выполнить проверку.");
    }
}
