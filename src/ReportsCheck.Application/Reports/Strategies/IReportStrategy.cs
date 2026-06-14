using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Application.Reports.Strategies;

/// <summary>
/// Стратегия проверки отчётов. Порт ReportStrategy (one-model / multiple-model).
/// </summary>
public interface IReportStrategy
{
    Task<IReadOnlyList<Check>> CheckAsync(ReportCheckJob job, CancellationToken cancellationToken = default);
}

/// <summary>
/// Выбор стратегии по количеству моделей. Порт ReportStrategy.getStrategy.
/// </summary>
public interface IReportStrategyFactory
{
    IReportStrategy GetStrategy(int modelsCount);
}
