namespace ReportsCheck.Application.Llm;

/// <summary>
/// Возвращает цены токенов для модели по её идентификатору из каталога OpenRouter.
/// </summary>
public interface IOpenRouterPricingService
{
    /// <summary>
    /// Возвращает (цена входных токенов, цена выходных токенов) за 1M токенов в USD,
    /// или <c>null</c> если модель не найдена или запрос не удался.
    /// </summary>
    Task<OpenRouterPricing?> GetPricingAsync(string modelId, CancellationToken cancellationToken = default);
}

public sealed record OpenRouterPricing(decimal InputPricePerMillion, decimal OutputPricePerMillion);
