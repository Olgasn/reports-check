using System.Security.Cryptography;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Logging;

namespace ReportsCheck.Infrastructure.Security;

/// <summary>
/// Шифрование секретов через ASP.NET Core Data Protection. Зашифрованные значения
/// помечаются префиксом <see cref="Prefix"/>, что позволяет отличать их от «старых»
/// открытых значений и делает повторное шифрование идемпотентным.
/// </summary>
public sealed class DataProtectionSecretProtector : ISecretProtector
{
    /// <summary>Маркер зашифрованного значения. Открытый текст его никогда не содержит.</summary>
    private const string Prefix = "dpapi:v1:";

    private readonly IDataProtector _protector;
    private readonly ILogger<DataProtectionSecretProtector> _logger;

    public DataProtectionSecretProtector(IDataProtectionProvider provider, ILogger<DataProtectionSecretProtector> logger)
    {
        _protector = provider.CreateProtector("ReportsCheck.Secrets.v1");
        _logger = logger;
    }

    public string Protect(string value)
    {
        if (string.IsNullOrEmpty(value) || IsProtected(value))
        {
            return value;
        }

        return Prefix + _protector.Protect(value);
    }

    public string Unprotect(string value)
    {
        if (!IsProtected(value))
        {
            return value; // старое открытое значение — отдаём как есть
        }

        try
        {
            return _protector.Unprotect(value[Prefix.Length..]);
        }
        catch (CryptographicException ex)
        {
            // Ключ-ринг недоступен/потерян — секрет восстановить нельзя. Не валим
            // приложение: возвращаем пустую строку, значение трактуется как «не задано».
            _logger.LogError(ex, "Не удалось расшифровать секрет — ключ-ринг недоступен. Введите значение заново.");
            return string.Empty;
        }
    }

    public bool IsProtected(string value) =>
        !string.IsNullOrEmpty(value) && value.StartsWith(Prefix, StringComparison.Ordinal);
}
