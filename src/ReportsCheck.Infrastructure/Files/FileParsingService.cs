using System.IO.Compression;
using ReportsCheck.Application.Files;
using ReportsCheck.Application.Reports.Models;

namespace ReportsCheck.Infrastructure.Files;

/// <summary>
/// Разбор архивов и одиночных отчётов. Порт FileService (parseStudentsFromFile,
/// parseArchive, parseSingleReport, parseFolderName, parseStudentFromFilename).
/// </summary>
public class FileParsingService : IFileParsingService
{
    private static readonly string[] ReportExtensions = [".pdf", ".docx", ".doc"];
    private readonly IDocumentTextExtractor _textExtractor;

    public FileParsingService(IDocumentTextExtractor textExtractor)
    {
        _textExtractor = textExtractor;
    }

    public Task<IReadOnlyList<ParsedStudent>> ParseStudentsFromArchiveAsync(byte[] zipBuffer, CancellationToken cancellationToken = default)
    {
        using var stream = new MemoryStream(zipBuffer);
        using var archive = new ZipArchive(stream, ZipArchiveMode.Read);

        var students = new List<ParsedStudent>();

        foreach (var entry in archive.Entries)
        {
            // Каталоги в ZipArchive имеют пустое имя записи.
            if (string.IsNullOrEmpty(entry.Name))
            {
                continue;
            }

            var fileName = entry.FullName;
            var info = fileName.Split('_')[0].Split(' ');
            var surname = info.ElementAtOrDefault(0) ?? string.Empty;
            var name = info.ElementAtOrDefault(1) ?? string.Empty;
            var middlename = info.ElementAtOrDefault(2) ?? string.Empty;

            students.Add(new ParsedStudent(name, surname, middlename, Guid.NewGuid().ToString()));
        }

        return Task.FromResult<IReadOnlyList<ParsedStudent>>(students);
    }

    public async Task<IReadOnlyList<ParsedReport>> ParseArchiveAsync(byte[] zipBuffer, CancellationToken cancellationToken = default)
    {
        using var stream = new MemoryStream(zipBuffer);
        using var archive = new ZipArchive(stream, ZipArchiveMode.Read);

        // Группируем записи по папке верхнего уровня (как process по подкаталогам).
        var folders = archive.Entries
            .Where(e => !string.IsNullOrEmpty(e.Name))
            .GroupBy(e => e.FullName.Replace('\\', '/').Split('/')[0]);

        var results = new List<ParsedReport>();

        foreach (var folder in folders)
        {
            var parsed = ParseFolderName(folder.Key);
            if (parsed is null)
            {
                continue;
            }

            var target = folder.FirstOrDefault(e =>
                ReportExtensions.Contains(Path.GetExtension(e.Name).ToLowerInvariant()));

            if (target is null)
            {
                continue;
            }

            var content = await ExtractEntryAsync(target, cancellationToken);
            results.Add(parsed with { Content = content });
        }

        return results;
    }

    public async Task<IReadOnlyList<ParsedReport>> ParseSingleReportAsync(string fileName, byte[] content, ParsedStudent? student, CancellationToken cancellationToken = default)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();

        if (ext is not (".pdf" or ".docx" or ".txt"))
        {
            throw new InvalidOperationException("Одиночная проверка поддерживает только файлы .pdf, .docx и .txt");
        }

        var text = await _textExtractor.ExtractTextAsync(fileName, content, cancellationToken);
        var (name, surname, middlename) = student is not null
            ? (student.Name, student.Surname, student.Middlename)
            : ParseStudentFromFilename(fileName);

        var num = Path.GetFileNameWithoutExtension(fileName);
        return [new ParsedReport(name, surname, middlename, num, text)];
    }

    private async Task<string> ExtractEntryAsync(ZipArchiveEntry entry, CancellationToken cancellationToken)
    {
        await using var entryStream = entry.Open();
        using var ms = new MemoryStream();
        await entryStream.CopyToAsync(ms, cancellationToken);
        return await _textExtractor.ExtractTextAsync(entry.Name, ms.ToArray(), cancellationToken);
    }

    private static ParsedReport? ParseFolderName(string folderName)
    {
        var parts = folderName.Split('_');
        var info = parts[0].Split(' ');
        var surname = info.ElementAtOrDefault(0) ?? string.Empty;
        var name = info.ElementAtOrDefault(1) ?? string.Empty;
        var middlename = info.ElementAtOrDefault(2) ?? string.Empty;
        var num = parts.ElementAtOrDefault(1) ?? string.Empty;

        return new ParsedReport(name, surname, middlename, num, string.Empty);
    }

    private static (string Name, string Surname, string Middlename) ParseStudentFromFilename(string fileName)
    {
        var baseName = Path.GetFileNameWithoutExtension(fileName);
        var info = baseName.Split('_')[0];

        if (string.IsNullOrEmpty(info))
        {
            throw new InvalidOperationException("Не удалось извлечь ФИО студента из имени файла");
        }

        var parts = info.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var surname = parts.ElementAtOrDefault(0);
        var name = parts.ElementAtOrDefault(1);
        var middlename = parts.ElementAtOrDefault(2);

        if (string.IsNullOrEmpty(surname) || string.IsNullOrEmpty(name) || string.IsNullOrEmpty(middlename))
        {
            throw new InvalidOperationException("Для одиночной проверки задайте имя файла в формате \"Фамилия Имя Отчество_...\"");
        }

        return (name, surname, middlename);
    }
}
