using FluentAssertions;
using ReportsCheck.Application.Llm;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.UnitTests.Llm;

public class LlmCostTests
{
    [Fact]
    public void Compute_UsesPerMillionTokenPrices()
    {
        var model = new Model { InputTokenPrice = 3m, OutputTokenPrice = 15m };

        // 500_000 вход. * 3$/1M + 200_000 выход. * 15$/1M = 1.5 + 3.0 = 4.5
        var cost = LlmCost.Compute(model, 500_000, 200_000);

        cost.Should().Be(4.5m);
    }

    [Fact]
    public void Compute_ReturnsZero_WhenPricesAreZero()
    {
        var model = new Model { InputTokenPrice = 0m, OutputTokenPrice = 0m };

        var cost = LlmCost.Compute(model, 123_456, 654_321);

        cost.Should().Be(0m);
    }
}
