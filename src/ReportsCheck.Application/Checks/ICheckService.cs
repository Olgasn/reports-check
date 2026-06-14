using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Application.Checks;

/// <summary>
/// Запросы по проверкам, требующие include/order. Порт CheckService
/// (read-часть). Реализуется в Infrastructure поверх EF Core.
/// </summary>
public interface ICheckService
{
    Task<Check?> FindLastCheckAsync(int studentId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LabCheckGroup>> GetLabChecksAsync(int labId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Check>> GetByIdsAsync(IReadOnlyList<int> ids, CancellationToken cancellationToken = default);
}

/// <summary>Проверки лабораторной, сгруппированные по группе и студенту. Порт CheckGrDto.</summary>
public record LabCheckGroup(Group Group, IReadOnlyList<StudentChecks> Results);

public record StudentChecks(Student Student, IReadOnlyList<Check> Checks);
