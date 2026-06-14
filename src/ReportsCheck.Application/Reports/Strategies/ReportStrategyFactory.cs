using Microsoft.Extensions.DependencyInjection;

namespace ReportsCheck.Application.Reports.Strategies;

/// <summary>
/// ≥2 моделей → MultipleModelStrategy, иначе OneModelStrategy. Порт ReportStrategy.getStrategy.
/// </summary>
public class ReportStrategyFactory : IReportStrategyFactory
{
    private readonly IServiceProvider _serviceProvider;

    public ReportStrategyFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public IReportStrategy GetStrategy(int modelsCount) =>
        modelsCount >= 2
            ? _serviceProvider.GetRequiredService<MultipleModelStrategy>()
            : _serviceProvider.GetRequiredService<OneModelStrategy>();
}
