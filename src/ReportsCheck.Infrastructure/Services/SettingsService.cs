using Microsoft.EntityFrameworkCore;
using ReportsCheck.Application.Settings;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Infrastructure.Persistence;

namespace ReportsCheck.Infrastructure.Services;

/// <summary>
/// Хранит единственную строку настроек в таблице AppSettings.
/// При первом обращении создаёт её со значениями по умолчанию.
/// </summary>
public class SettingsService : ISettingsService
{
    private readonly AppDbContext _db;

    public SettingsService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<AppSettings> GetAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _db.AppSettings.FirstOrDefaultAsync(cancellationToken);
        if (settings is null)
        {
            settings = new AppSettings();
            _db.AppSettings.Add(settings);
            await _db.SaveChangesAsync(cancellationToken);
        }

        return settings;
    }

    public async Task SaveAsync(AppSettings settings, CancellationToken cancellationToken = default)
    {
        var existing = await _db.AppSettings.FirstOrDefaultAsync(cancellationToken);
        if (existing is null)
        {
            _db.AppSettings.Add(settings);
        }
        else
        {
            existing.GitHubToken = settings.GitHubToken;
            existing.GitHubOrg = settings.GitHubOrg;
            existing.GitHubOwner = settings.GitHubOwner;
            existing.RepoPrivate = settings.RepoPrivate;
            existing.SmtpServer = settings.SmtpServer;
            existing.SmtpPort = settings.SmtpPort;
            existing.SenderName = settings.SenderName;
            existing.SenderEmail = settings.SenderEmail;
            existing.SmtpPassword = settings.SmtpPassword;
        }

        await _db.SaveChangesAsync(cancellationToken);
    }
}
