using Microsoft.Extensions.AI;
using Microsoft.Extensions.Options;
using OllamaSharp;
using ReportsCheck.Application.Llm;
using ReportsCheck.Application.Prompts;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Infrastructure.Llm.Handlers;

/// <summary>
/// Локальная Ollama через Microsoft.Extensions.AI (OllamaSharp реализует IChatClient). Порт OllamaHandler.
/// </summary>
public class OllamaHandler : ILlmProviderHandler
{
    private readonly LlmOptions _options;

    public OllamaHandler(IOptions<LlmOptions> options)
    {
        _options = options.Value;
    }

    public async Task<LlmResult> CompletionAsync(SplitPrompt prompt, Model model, CancellationToken cancellationToken)
    {
        IChatClient client = new OllamaApiClient(new Uri(_options.OllamaEndpoint), model.Value);

        var messages = new List<ChatMessage>();
        if (!string.IsNullOrEmpty(prompt.System))
        {
            messages.Add(new ChatMessage(ChatRole.System, prompt.System));
        }
        messages.Add(new ChatMessage(ChatRole.User, prompt.User));

        var chatOptions = new ChatOptions
        {
            Temperature = (float)model.Temperature,
            TopP = (float)model.TopP,
        };

        var response = await client.GetResponseAsync(messages, chatOptions, cancellationToken);
        return new LlmResult(
            response.Text ?? string.Empty,
            (int)(response.Usage?.InputTokenCount ?? 0),
            (int)(response.Usage?.OutputTokenCount ?? 0));
    }

    public void ProcessError(Exception error)
    {
        // Порт OllamaHandler.processError: ошибки Ollama пробрасываются (повтор не выполняется).
        throw new InvalidOperationException(error.Message);
    }
}
