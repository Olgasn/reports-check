using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using ReportsCheck.Application.Llm;

namespace ReportsCheck.Infrastructure.Llm;

public sealed class OpenRouterPricingService : IOpenRouterPricingService
{
    private const string ModelsUrl = "https://openrouter.ai/api/v1/models";
    private const decimal PerToken = 1_000_000m;

    private readonly IHttpClientFactory _factory;
    private readonly ILogger<OpenRouterPricingService> _logger;

    public OpenRouterPricingService(IHttpClientFactory factory, ILogger<OpenRouterPricingService> logger)
    {
        _factory = factory;
        _logger = logger;
    }

    public async Task<OpenRouterPricing?> GetPricingAsync(string modelId, CancellationToken cancellationToken = default)
    {
        try
        {
            var client = _factory.CreateClient();
            var response = await client.GetFromJsonAsync<ModelsResponse>(
                ModelsUrl, _jsonOptions, cancellationToken);

            var model = response?.Data.FirstOrDefault(m =>
                string.Equals(m.Id, modelId, StringComparison.OrdinalIgnoreCase));

            if (model is null)
            {
                _logger.LogWarning("Модель {ModelId} не найдена в каталоге OpenRouter", modelId);
                return null;
            }

            // OpenRouter возвращает цены как строки ("0.000000435"), а не числа JSON.
            if (!decimal.TryParse(model.Pricing.Prompt, NumberStyles.Float, CultureInfo.InvariantCulture, out var promptPrice) ||
                !decimal.TryParse(model.Pricing.Completion, NumberStyles.Float, CultureInfo.InvariantCulture, out var completionPrice))
            {
                _logger.LogWarning("Не удалось разобрать цены модели {ModelId}: prompt={Prompt} completion={Completion}",
                    modelId, model.Pricing.Prompt, model.Pricing.Completion);
                return null;
            }

            return new OpenRouterPricing(promptPrice * PerToken, completionPrice * PerToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при получении цен из OpenRouter для модели {ModelId}", modelId);
            return null;
        }
    }

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private sealed record ModelsResponse([property: JsonPropertyName("data")] List<ModelEntry> Data);
    private sealed record ModelEntry([property: JsonPropertyName("id")] string Id, [property: JsonPropertyName("pricing")] ModelPricing Pricing);

    // Цены приходят как строки, например "0.000000435" — читаем как string и парсим вручную.
    private sealed record ModelPricing([property: JsonPropertyName("prompt")] string Prompt, [property: JsonPropertyName("completion")] string Completion);
}
