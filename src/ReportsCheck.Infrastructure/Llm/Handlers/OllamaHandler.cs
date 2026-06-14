using Microsoft.Extensions.Options;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.Ollama;
using ReportsCheck.Application.Prompts;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Infrastructure.Llm.Handlers;

/// <summary>
/// Локальная Ollama через Semantic Kernel. Порт OllamaHandler.
/// </summary>
#pragma warning disable SKEXP0070 // Ollama-коннектор помечен как экспериментальный.
public class OllamaHandler : ILlmProviderHandler
{
    private readonly LlmOptions _options;

    public OllamaHandler(IOptions<LlmOptions> options)
    {
        _options = options.Value;
    }

    public async Task<string> CompletionAsync(SplitPrompt prompt, Model model, CancellationToken cancellationToken)
    {
        var builder = Kernel.CreateBuilder();
        builder.AddOllamaChatCompletion(modelId: model.Value, endpoint: new Uri(_options.OllamaEndpoint));

        var kernel = builder.Build();
        var chat = kernel.GetRequiredService<IChatCompletionService>();

        var history = new ChatHistory();
        if (!string.IsNullOrEmpty(prompt.System))
        {
            history.AddSystemMessage(prompt.System);
        }
        history.AddUserMessage(prompt.User);

        var settings = new OllamaPromptExecutionSettings
        {
            Temperature = (float)model.Temperature,
            TopP = (float)model.TopP,
        };

        var result = await chat.GetChatMessageContentAsync(history, settings, kernel, cancellationToken);
        return result.Content ?? string.Empty;
    }

    public void ProcessError(Exception error)
    {
        // Порт OllamaHandler.processError: ошибки Ollama пробрасываются (повтор не выполняется).
        throw new InvalidOperationException(error.Message);
    }
}
#pragma warning restore SKEXP0070
