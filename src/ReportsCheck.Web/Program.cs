using MudBlazor.Services;
using ReportsCheck.Application;
using ReportsCheck.Application.Prompts;
using ReportsCheck.Infrastructure;
using ReportsCheck.Infrastructure.Persistence;
using ReportsCheck.Infrastructure.Security;
using ReportsCheck.Web;
using ReportsCheck.Web.Components;
using Serilog;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .WriteTo.Console()
    .WriteTo.File("logs/reports-check-.txt", rollingInterval: RollingInterval.Day, fileSizeLimitBytes: 10_000_000));

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddMudServices();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Шифрование секретов в БД использует ОТДЕЛЬНЫЙ, изолированный экземпляр Data
// Protection с собственным набором ключей в каталоге DataProtection-Keys.
// Важно: основной key-ring приложения (его используют Blazor Server для защиты
// состояния компонентов и antiforgery) НЕ трогаем. Если переназначить его
// расположение через AddDataProtection().PersistKeysToFileSystem(...), ранее
// защищённые этим ключом payload'ы перестают расшифровываться, и рендеринг
// страниц падает с CryptographicException («key ... not found in the key ring»).
var keysPath = Path.Combine(builder.Environment.ContentRootPath, "DataProtection-Keys");
var secretProtectionProvider = DataProtectionProvider.Create(
    new DirectoryInfo(keysPath),
    configure =>
    {
        configure.SetApplicationName("ReportsCheck");
        if (OperatingSystem.IsWindows())
        {
            configure.ProtectKeysWithDpapi();
        }
    });
builder.Services.AddSingleton<ISecretProtector>(sp =>
    new DataProtectionSecretProtector(
        secretProtectionProvider,
        sp.GetRequiredService<ILogger<DataProtectionSecretProtector>>()));

// Шаблоны промптов загружаются один раз при старте.
builder.Services.AddSingleton(PromptTemplatesLoader.Load(builder.Environment.ContentRootPath));

var app = builder.Build();

// Применение миграций при старте.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();

    // Разовая перешифровка ранее сохранённых открытых секретов (идемпотентно).
    var secretMigrator = scope.ServiceProvider.GetRequiredService<SecretEncryptionMigrator>();
    await secretMigrator.MigrateAsync(db);
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);
app.UseHttpsRedirection();
app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
