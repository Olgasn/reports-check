using Microsoft.EntityFrameworkCore;
using ReportsCheck.Application.Common.Exceptions;
using ReportsCheck.Application.Reports;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Infrastructure.Persistence;

namespace ReportsCheck.Infrastructure.Services;

/// <summary>
/// Загрузка лабораторной (с курсом и промптом) и моделей (с ключом и провайдером).
/// Порт LabService.findOne(.., {course:{prompt}}) и ModelService.findOne/findByIds.
/// </summary>
public class ReportDataProvider : IReportDataProvider
{
    private readonly AppDbContext _db;

    public ReportDataProvider(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Lab> GetLabWithCoursePromptAsync(int labId, CancellationToken cancellationToken = default)
    {
        return await _db.Labs
            .Include(l => l.Course).ThenInclude(c => c.Prompt)
            .FirstOrDefaultAsync(l => l.Id == labId, cancellationToken)
            ?? throw new NotFoundException("Лабораторная работа не была найдена.");
    }

    public async Task<Model> GetModelWithRelationsAsync(int modelId, CancellationToken cancellationToken = default)
    {
        return await _db.Models
            .Include(m => m.Key)
            .Include(m => m.Provider)
            .FirstOrDefaultAsync(m => m.Id == modelId, cancellationToken)
            ?? throw new NotFoundException("Модель не была найдена.");
    }

    public async Task<IReadOnlyList<Model>> GetModelsWithRelationsAsync(IReadOnlyList<int> ids, CancellationToken cancellationToken = default)
    {
        return await _db.Models
            .Include(m => m.Key)
            .Include(m => m.Provider)
            .Where(m => ids.Contains(m.Id))
            .ToListAsync(cancellationToken);
    }
}
