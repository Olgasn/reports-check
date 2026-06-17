namespace ReportsCheck.Application.Email;

/// <summary>
/// Отправка письма по SMTP. Параметры сервера берутся из настроек приложения (БД).
/// Калька интерфейса из проекта PersonalLearning.
/// </summary>
public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default);
}
