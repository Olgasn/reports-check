namespace ReportsCheck.Infrastructure.Security;

/// <summary>
/// Заглушка без шифрования — значения проходят насквозь. Используется во время
/// разработки (dotnet ef) и в тестах, где Data Protection не сконфигурирован.
/// </summary>
public sealed class IdentitySecretProtector : ISecretProtector
{
    public static readonly IdentitySecretProtector Instance = new();

    public string Protect(string value) => value;

    public string Unprotect(string value) => value;

    public bool IsProtected(string value) => false;
}
