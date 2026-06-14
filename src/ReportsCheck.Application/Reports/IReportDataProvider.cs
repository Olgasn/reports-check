using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Application.Reports;

/// <summary>
/// Загрузка агрегатов с include для конвейера проверки. Объединяет
/// LabService.findOne(.., {course:{prompt}}) и ModelService.findOne/findByIds.
/// Реализуется в Infrastructure поверх EF Core.
/// </summary>
public interface IReportDataProvider
{
    Task<Lab> GetLabWithCoursePromptAsync(int labId, CancellationToken cancellationToken = default);

    Task<Model> GetModelWithRelationsAsync(int modelId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Model>> GetModelsWithRelationsAsync(IReadOnlyList<int> ids, CancellationToken cancellationToken = default);
}
