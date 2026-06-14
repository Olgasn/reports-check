using ReportsCheck.Application.Reports.Models;

namespace ReportsCheck.Application.Reports;

/// <summary>
/// Загруженный файл (архив отчётов или одиночный отчёт).
/// </summary>
public record UploadedFile(string FileName, byte[] Content);

/// <summary>
/// Задание на проверку отчётов, помещаемое в очередь. Порт CheckReportDto.
/// </summary>
public class ReportCheckJob
{
    public required IReadOnlyList<int> ModelsId { get; init; }
    public IReadOnlyList<ParsedStudent> StudentsId { get; init; } = [];
    public required int LabId { get; init; }
    public required int GroupId { get; init; }
    public bool CheckPrev { get; init; }
    public UploadedFile? ReportsZip { get; init; }
    public UploadedFile? ReportFile { get; init; }
}
