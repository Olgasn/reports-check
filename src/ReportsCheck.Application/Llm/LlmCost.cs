using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Application.Llm;

/// <summary>
/// Расчёт стоимости запроса по ценам модели (за 1 000 000 токенов, USD).
/// Для локальной Ollama цены = 0, поэтому стоимость = 0.
/// </summary>
public static class LlmCost
{
    private const decimal TokensPerUnit = 1_000_000m;

    public static decimal Compute(Model model, int inputTokens, int outputTokens) =>
        inputTokens / TokensPerUnit * model.InputTokenPrice
        + outputTokens / TokensPerUnit * model.OutputTokenPrice;
}
