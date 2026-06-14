using System.Net;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using ReportsCheck.Application.Prompts;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Infrastructure.Llm.Handlers;

/// <summary>
/// OpenAI / OpenRouter через Semantic Kernel. Порт OpenAiHandler.
/// Сохранены настройки исходника: top_p, temperature, max_tokens, reasoning_effort='high',
/// заголовки HTTP-Referer / X-Title.
/// ВНИМАНИЕ (известный компромисс): Semantic Kernel не предоставляет чистого способа
/// задать Anthropic ephemeral cache_control на блоках сообщений — реализовано по
/// возможности (model.CacheControl фактически не транслируется в cache_control).
/// reasoning_effort передаётся через ExtensionData и может игнорироваться коннектором.
/// </summary>
public class OpenAiHandler : ILlmProviderHandler
{
    private static readonly HttpClient SharedClient = CreateClient();

    private static HttpClient CreateClient()
    {
        var client = new HttpClient();
        client.DefaultRequestHeaders.Add("HTTP-Referer", "https://github.com/Olgasn/reports-check");
        client.DefaultRequestHeaders.Add("X-Title", "Reports_Check");
        return client;
    }

    public async Task<string> CompletionAsync(SplitPrompt prompt, Model model, CancellationToken cancellationToken)
    {
        if (model.Provider is null || model.Key is null)
        {
            throw new InvalidOperationException("No provider or key specified for the model");
        }

        var builder = Kernel.CreateBuilder();
        builder.AddOpenAIChatCompletion(
            modelId: model.Value,
            endpoint: new Uri(model.Provider.Url),
            apiKey: model.Key.Value,
            httpClient: SharedClient);

        var kernel = builder.Build();
        var chat = kernel.GetRequiredService<IChatCompletionService>();

        var history = new ChatHistory();
        if (!string.IsNullOrEmpty(prompt.System))
        {
            history.AddSystemMessage(prompt.System);
        }
        history.AddUserMessage(prompt.User);

        var settings = new OpenAIPromptExecutionSettings
        {
            Temperature = model.Temperature,
            TopP = model.TopP,
            MaxTokens = model.MaxTokens,
            ExtensionData = new Dictionary<string, object> { ["reasoning_effort"] = "high" },
        };

        var result = await chat.GetChatMessageContentAsync(history, settings, kernel, cancellationToken);
        var content = result.Content;

        if (string.IsNullOrEmpty(content))
        {
            throw new InvalidOperationException($"Received empty response from model [{model.Value}]");
        }

        return content;
    }

    public void ProcessError(Exception error)
    {
        if (error is HttpOperationException { StatusCode: HttpStatusCode.BadRequest } httpEx)
        {
            throw new InvalidOperationException(httpEx.Message);
        }
    }
}
