using Microsoft.Extensions.DependencyInjection;
using ReportsCheck.Infrastructure.Llm.Handlers;
using LlmInterfaceEnum = ReportsCheck.Domain.Enums.LlmInterface;

namespace ReportsCheck.Infrastructure.Llm;

/// <summary>
/// Выбор обработчика по интерфейсу модели. Порт LlmProviderFactory.
/// </summary>
public class LlmProviderFactory : ILlmProviderFactory
{
    private readonly IServiceProvider _serviceProvider;

    public LlmProviderFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public ILlmProviderHandler Create(LlmInterfaceEnum llmInterface) => llmInterface switch
    {
        LlmInterfaceEnum.OpenAi => _serviceProvider.GetRequiredService<OpenAiHandler>(),
        LlmInterfaceEnum.Ollama => _serviceProvider.GetRequiredService<OllamaHandler>(),
        _ => throw new ArgumentOutOfRangeException(nameof(llmInterface), llmInterface, "Неизвестный LLM-интерфейс"),
    };
}
