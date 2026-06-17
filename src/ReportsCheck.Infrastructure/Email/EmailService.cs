using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using MimeKit;
using ReportsCheck.Application.Email;
using ReportsCheck.Application.Settings;

namespace ReportsCheck.Infrastructure.Email;

/// <summary>
/// Отправка писем по SMTP через MailKit. Параметры берутся из настроек приложения (БД).
/// Порт EmailService из проекта PersonalLearning (порт 465 → SSL, иначе STARTTLS).
/// </summary>
public class EmailService : IEmailService
{
    private readonly ISettingsService _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(ISettingsService settings, ILogger<EmailService> logger)
    {
        _settings = settings;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        var settings = await _settings.GetAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(settings.SmtpServer))
        {
            throw new InvalidOperationException("SMTP-сервер не настроен. Заполните настройки рассылки.");
        }

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(settings.SenderName, settings.SenderEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

            using var client = new SmtpClient();

            var useSsl = settings.SmtpPort == 465;
            await client.ConnectAsync(
                settings.SmtpServer,
                settings.SmtpPort,
                useSsl ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls,
                cancellationToken);

            if (!string.IsNullOrEmpty(settings.SmtpPassword))
            {
                await client.AuthenticateAsync(settings.SenderEmail, settings.SmtpPassword, cancellationToken);
            }

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            _logger.LogInformation("Письмо отправлено на {ToEmail} с темой «{Subject}»", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Не удалось отправить письмо на {ToEmail}", toEmail);
            throw;
        }
    }
}
