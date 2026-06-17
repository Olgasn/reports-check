namespace ReportsCheck.Domain.Entities;

/// <summary>
/// Глобальные настройки приложения (одна строка в таблице): доступ к GitHub
/// и параметры SMTP-рассылки. Редактируются через UI.
/// Секреты (токен, пароль) хранятся в открытом виде — как и существующие API-ключи.
/// </summary>
public class AppSettings : BaseEntity
{
    // ----- GitHub -----
    /// <summary>Personal Access Token владельца (olgasn) с правами создания репозиториев в организации.</summary>
    public string GitHubToken { get; set; } = string.Empty;

    /// <summary>Организация GitHub, в которой создаются репозитории.</summary>
    public string GitHubOrg { get; set; } = "IT-GSTU";

    /// <summary>Владелец/аккаунт, от имени которого создаются репозитории.</summary>
    public string GitHubOwner { get; set; } = "olgasn";

    /// <summary>Создавать репозитории приватными.</summary>
    public bool RepoPrivate { get; set; } = true;

    // ----- SMTP -----
    /// <summary>Адрес SMTP-сервера. По умолчанию — сервер Gmail.</summary>
    public string SmtpServer { get; set; } = "smtp.gmail.com";

    /// <summary>Порт SMTP. 587 — STARTTLS (рекомендуется для Gmail); 465 — SSL.</summary>
    public int SmtpPort { get; set; } = 587;
    public string SenderName { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public string SmtpPassword { get; set; } = string.Empty;
}
