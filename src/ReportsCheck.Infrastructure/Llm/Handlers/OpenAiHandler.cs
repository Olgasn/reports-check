using System.ClientModel;
using System.ClientModel.Primitives;
using Microsoft.Extensions.AI;
using OpenAI;
using ReportsCheck.Application.Llm;
using ReportsCheck.Application.Prompts;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Infrastructure.Llm.Handlers;

/// <summary>
/// OpenAI / OpenRouter через Microsoft.Extensions.AI (IChatClient поверх OpenAI SDK). Порт OpenAiHandler.
/// Сохранены настройки исходника: top_p, temperature, max_tokens, reasoning_effort='high',
/// заголовки HTTP-Referer / X-Title (добавляются политикой конвейера).
/// ВНИМАНИЕ (известный компромисс): Microsoft.Extensions.AI не предоставляет чистого способа
/// задать Anthropic ephemeral cache_control на блоках сообщений (model.CacheControl фактически
/// не транслируется). reasoning_effort передаётся через AdditionalProperties и может игнорироваться
/// адаптером.
/// </summary>
public class OpenAiHandler : ILlmProviderHandler
{
    /// <summary>Политика, добавляющая заголовки OpenRouter к каждому запросу.</summary>
    private static readonly PipelinePolicy HeaderPolicy = new OpenRouterHeaderPolicy();

    public async Task<LlmResult> CompletionAsync(SplitPrompt prompt, Model model, CancellationToken cancellationToken)
    {
        if (model.Provider is null || model.Key is null)
        {
            throw new InvalidOperationException("No provider or key specified for the model");
        }

        var options = new OpenAIClientOptions { Endpoint = new Uri(model.Provider.Url) };
        options.AddPolicy(HeaderPolicy, PipelinePosition.PerCall);

        IChatClient client = new OpenAIClient(new ApiKeyCredential(model.Key.Value), options)
            .GetChatClient(model.Value)
            .AsIChatClient();

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
            MaxOutputTokens = model.MaxTokens,
            AdditionalProperties = new AdditionalPropertiesDictionary { ["reasoning_effort"] = "high" },
        };

        var response = await client.GetResponseAsync(messages, chatOptions, cancellationToken);
        var content = response.Text;

        if (string.IsNullOrEmpty(content))
        {
            throw new InvalidOperationException($"Received empty response from model [{model.Value}]");
        }

        return new LlmResult(
            content,
            (int)(response.Usage?.InputTokenCount ?? 0),
            (int)(response.Usage?.OutputTokenCount ?? 0));
    }

    public void ProcessError(Exception error)
    {
        if (error is ClientResultException { Status: 400 } ex)
        {
            throw new InvalidOperationException(ex.Message);
        }
    }

    private sealed class OpenRouterHeaderPolicy : PipelinePolicy
    {
        private static void SetHeaders(PipelineMessage message)
        {
            message.Request.Headers.Set("HTTP-Referer", "https://github.com/Olgasn/reports-check");
            message.Request.Headers.Set("X-Title", "Reports_Check");
        }

        public override void Process(PipelineMessage message, IReadOnlyList<PipelinePolicy> pipeline, int currentIndex)
        {
            SetHeaders(message);
            ProcessNext(message, pipeline, currentIndex);
        }

        public override ValueTask ProcessAsync(PipelineMessage message, IReadOnlyList<PipelinePolicy> pipeline, int currentIndex)
        {
            SetHeaders(message);
            return ProcessNextAsync(message, pipeline, currentIndex);
        }
    }
}
