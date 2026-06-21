namespace ReportsCheck.Infrastructure.Security;

/// <summary>
/// Шифрование/расшифровка секретов (ключи API, пароль SMTP, токен GitHub) при
/// хранении в БД. Реализация на ASP.NET Core Data Protection; ключ-ринг хранится
/// отдельно от БД, поэтому утечка файла <c>.sqlite</c> не раскрывает секреты.
/// </summary>
public interface ISecretProtector
{
    /// <summary>Зашифровать значение. Пустые значения и уже зашифрованные возвращаются без изменений.</summary>
    string Protect(string value);

    /// <summary>Расшифровать значение. «Старые» открытые значения (без маркера) возвращаются как есть.</summary>
    string Unprotect(string value);

    /// <summary>Признак того, что значение уже зашифровано (имеет маркер).</summary>
    bool IsProtected(string value);
}
