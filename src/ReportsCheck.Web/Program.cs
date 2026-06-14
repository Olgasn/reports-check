using MudBlazor.Services;
using ReportsCheck.Application;
using ReportsCheck.Application.Prompts;
using ReportsCheck.Infrastructure;
using ReportsCheck.Infrastructure.Persistence;
using ReportsCheck.Web;
using ReportsCheck.Web.Components;
using Serilog;
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

// Шаблоны промптов загружаются один раз при старте.
builder.Services.AddSingleton(PromptTemplatesLoader.Load(builder.Environment.ContentRootPath));

var app = builder.Build();

// Применение миграций при старте (как MigrateAsync в PersonalLearning).
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
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
