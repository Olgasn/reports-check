using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Application.Settings;

/// <summary>
/// Доступ к единственной строке настроек приложения (GitHub + SMTP).
/// При отсутствии строки создаёт её со значениями по умолчанию.
/// </summary>
public interface ISettingsService
{
    Task<AppSettings> GetAsync(CancellationToken cancellationToken = default);

    Task SaveAsync(AppSettings settings, CancellationToken cancellationToken = default);
}
