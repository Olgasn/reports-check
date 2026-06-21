using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ReportsCheck.Infrastructure.Persistence;

namespace ReportsCheck.Infrastructure.Security;

/// <summary>
/// Разовая перешифровка ранее сохранённых открытых секретов. Читает «сырые»
/// значения колонок напрямую (в обход EF-конвертера) и шифрует те, что ещё не
/// помечены маркером. Идемпотентна: при последующих запусках уже зашифрованные
/// значения пропускаются.
/// </summary>
public sealed class SecretEncryptionMigrator
{
    // Колонки с секретами: имена фиксированы в коде, не из пользовательского ввода.
    private static readonly (string Table, string Column)[] Targets =
    [
        ("Keys", "Value"),
        ("AppSettings", "SmtpPassword"),
        ("AppSettings", "GitHubToken"),
    ];

    private readonly ISecretProtector _protector;
    private readonly ILogger<SecretEncryptionMigrator> _logger;

    public SecretEncryptionMigrator(ISecretProtector protector, ILogger<SecretEncryptionMigrator> logger)
    {
        _protector = protector;
        _logger = logger;
    }

    public async Task MigrateAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        if (_protector is IdentitySecretProtector)
        {
            return; // шифрование не сконфигурировано — нечего мигрировать
        }

        var connection = db.Database.GetDbConnection();
        await connection.OpenAsync(cancellationToken);

        var encrypted = 0;
        foreach (var (table, column) in Targets)
        {
            // Сначала собираем строки, требующие шифрования, затем обновляем — чтобы
            // не держать reader открытым во время UPDATE на том же соединении.
            var pending = new List<(int Id, string Value)>();

            await using (var read = connection.CreateCommand())
            {
                read.CommandText = $"SELECT Id, {column} FROM {table}";
                await using var reader = await read.ExecuteReaderAsync(cancellationToken);
                while (await reader.ReadAsync(cancellationToken))
                {
                    if (reader.IsDBNull(1))
                    {
                        continue;
                    }

                    var raw = reader.GetString(1);
                    if (!string.IsNullOrEmpty(raw) && !_protector.IsProtected(raw))
                    {
                        pending.Add((reader.GetInt32(0), raw));
                    }
                }
            }

            foreach (var (id, value) in pending)
            {
                await using var update = connection.CreateCommand();
                update.CommandText = $"UPDATE {table} SET {column} = $value WHERE Id = $id";

                var pValue = update.CreateParameter();
                pValue.ParameterName = "$value";
                pValue.Value = _protector.Protect(value);
                update.Parameters.Add(pValue);

                var pId = update.CreateParameter();
                pId.ParameterName = "$id";
                pId.Value = id;
                update.Parameters.Add(pId);

                await update.ExecuteNonQueryAsync(cancellationToken);
                encrypted++;
            }
        }

        if (encrypted > 0)
        {
            _logger.LogInformation("Зашифровано ранее открытых секретов: {Count}", encrypted);
        }
    }
}
