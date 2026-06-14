using Microsoft.EntityFrameworkCore;
using ReportsCheck.Application.Checks;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Infrastructure.Persistence;

namespace ReportsCheck.Infrastructure.Services;

/// <summary>
/// Read-часть CheckService из исходного проекта (запросы с include/group/order).
/// </summary>
public class CheckService : ICheckService
{
    private readonly AppDbContext _db;

    public CheckService(AppDbContext db)
    {
        _db = db;
    }

    public Task<Check?> FindLastCheckAsync(int studentId, CancellationToken cancellationToken = default) =>
        _db.Checks
            .Where(c => c.StudentId == studentId)
            .OrderByDescending(c => c.Date)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<LabCheckGroup>> GetLabChecksAsync(int labId, CancellationToken cancellationToken = default)
    {
        var checks = await _db.Checks
            .Where(c => c.LabId == labId)
            .Include(c => c.Student).ThenInclude(s => s.Group)
            .Include(c => c.Model)
            .ToListAsync(cancellationToken);

        // Группировка: группа -> студент -> проверки. Порт CheckService.getLabChecks.
        return checks
            .Where(c => c.Student.Group is not null)
            .GroupBy(c => c.Student.Group!.Id)
            .Select(groupChecks =>
            {
                var group = groupChecks.First().Student.Group!;
                var results = groupChecks
                    .GroupBy(c => c.Student.Id)
                    .Select(studentChecks => new StudentChecks(
                        studentChecks.First().Student,
                        studentChecks.ToList()))
                    .ToList();

                return new LabCheckGroup(group, results);
            })
            .ToList();
    }

    public async Task<IReadOnlyList<Check>> GetByIdsAsync(IReadOnlyList<int> ids, CancellationToken cancellationToken = default)
    {
        return await _db.Checks
            .Where(c => ids.Contains(c.Id))
            .Include(c => c.Student)
            .Include(c => c.Model)
            .ToListAsync(cancellationToken);
    }
}
