using ReportsCheck.Application.Reports.Models;

namespace ReportsCheck.Application.Files;

/// <summary>
/// Разбор загруженных файлов отчётов. Порт FileService.
/// </summary>
public interface IFileParsingService
{
    Task<IReadOnlyList<ParsedStudent>> ParseStudentsFromArchiveAsync(byte[] zipBuffer, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ParsedReport>> ParseArchiveAsync(byte[] zipBuffer, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ParsedReport>> ParseSingleReportAsync(string fileName, byte[] content, ParsedStudent? student, CancellationToken cancellationToken = default);
}

/// <summary>
/// Парсинг произвольного файла задания (PDF/DOCX/TXT) для лабораторной работы.
/// </summary>
public interface IDocumentTextExtractor
{
    Task<string> ExtractTextAsync(string fileName, byte[] content, CancellationToken cancellationToken = default);
}

/// <summary>
/// Импорт студентов из CSV. Порт StudentService.importFromCsv.
/// </summary>
public interface IStudentCsvImporter
{
    Task<ImportStudentsResult> ImportAsync(byte[] csvBuffer, CancellationToken cancellationToken = default);
}

public record ImportStudentsResult(
    int TotalRows,
    int CreatedStudents,
    int DuplicateStudents,
    int CreatedGroups,
    int SkippedRows);
