using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using ReportsCheck.Application.Common.Behaviors;
using ReportsCheck.Application.Prompts;
using ReportsCheck.Application.Reports;
using ReportsCheck.Application.Reports.Strategies;
using ReportsCheck.Application.Security;

namespace ReportsCheck.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));
        services.AddValidatorsFromAssembly(assembly, ServiceLifetime.Singleton, includeInternalTypes: true);

        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        // Чистая логика без БД — singleton.
        services.AddSingleton<IPromptInjectionService, PromptInjectionService>();
        services.AddSingleton<IPromptService, PromptService>();
        services.AddSingleton<IModelResultExtractor, ModelResultExtractor>();

        // Конвейер проверки. ReportChecker открывает собственные scope для БД.
        services.AddSingleton<ReportChecker>();
        services.AddScoped<OneModelStrategy>();
        services.AddScoped<MultipleModelStrategy>();
        services.AddScoped<IReportStrategyFactory, ReportStrategyFactory>();

        return services;
    }
}
