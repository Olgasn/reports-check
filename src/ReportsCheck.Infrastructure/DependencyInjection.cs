using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ReportsCheck.Application.Checks;
using ReportsCheck.Application.Files;
using ReportsCheck.Application.Llm;
using ReportsCheck.Application.Notifications;
using ReportsCheck.Application.Reports;
using ReportsCheck.Domain.Interfaces;
using ReportsCheck.Infrastructure.BackgroundJobs;
using ReportsCheck.Infrastructure.Files;
using ReportsCheck.Infrastructure.Llm;
using ReportsCheck.Infrastructure.Llm.Handlers;
using ReportsCheck.Infrastructure.Notifications;
using ReportsCheck.Infrastructure.Persistence;
using ReportsCheck.Infrastructure.Services;

namespace ReportsCheck.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            var dbPath = configuration["DATABASE"] ?? "reports-check.sqlite";
            connectionString = $"Data Source={dbPath}";
        }

        services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Read-сервисы (используют DbContext).
        services.AddScoped<ICheckService, CheckService>();
        services.AddScoped<IReportDataProvider, ReportDataProvider>();
        services.AddScoped<IStudentCsvImporter, StudentCsvImporter>();

        // Файлы.
        services.AddSingleton<IDocumentTextExtractor, DocumentTextExtractor>();
        services.AddTransient<IFileParsingService, FileParsingService>();

        // Уведомления (singleton — общий для всех Blazor-кругов).
        services.AddSingleton<INotificationService, InMemoryNotificationService>();

        // LLM.
        services.Configure<LlmOptions>(configuration.GetSection(LlmOptions.SectionName));
        services.AddSingleton<IModelResponseLogger, ModelResponseLogger>();
        services.AddSingleton<OpenAiHandler>();
        services.AddSingleton<OllamaHandler>();
        services.AddSingleton<ILlmProviderFactory, LlmProviderFactory>();
        services.AddSingleton<ILlmService, SemanticKernelLlmService>();

        // Очередь и фоновый обработчик проверок.
        services.AddSingleton<IReportCheckQueue, ReportCheckQueue>();
        services.AddHostedService<ReportCheckWorker>();

        return services;
    }
}
