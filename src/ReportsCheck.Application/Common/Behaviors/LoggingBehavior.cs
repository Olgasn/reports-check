using MediatR;
using Microsoft.Extensions.Logging;

namespace ReportsCheck.Application.Common.Behaviors;

public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var name = typeof(TRequest).Name;
        _logger.LogInformation("Обработка запроса {RequestName}", name);

        try
        {
            var response = await next(cancellationToken);
            _logger.LogInformation("Запрос {RequestName} обработан", name);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при обработке запроса {RequestName}", name);
            throw;
        }
    }
}
