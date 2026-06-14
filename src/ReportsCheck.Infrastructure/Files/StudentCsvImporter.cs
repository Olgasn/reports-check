using System.Text;
using Microsoft.EntityFrameworkCore;
using ReportsCheck.Application.Files;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Infrastructure.Persistence;

namespace ReportsCheck.Infrastructure.Files;

/// <summary>
/// Импорт студентов из CSV. Прямой порт StudentService.importFromCsv
/// (определение кодировки UTF-8/win1251, разделителя, дедуп по ФИО+группе).
/// </summary>
public class StudentCsvImporter : IStudentCsvImporter
{
    private readonly AppDbContext _db;

    static StudentCsvImporter()
    {
        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
    }

    public StudentCsvImporter(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ImportStudentsResult> ImportAsync(byte[] csvBuffer, CancellationToken cancellationToken = default)
    {
        var content = DecodeCsv(csvBuffer);
        var parsedRows = ParseCsv(content);

        if (parsedRows.Count < 2)
        {
            throw new InvalidOperationException("CSV файл пустой или содержит только заголовки.");
        }

        var headers = parsedRows[0].Select(NormalizeHeader).ToList();
        var dataRows = parsedRows.Skip(1).ToList();

        var nameIdx = headers.FindIndex(h => h == "имя" || h == "firstname");
        var surnameIdx = headers.FindIndex(h => h.StartsWith("фам") || h == "lastname");
        var middlenameIdx = headers.FindIndex(h => h.StartsWith("отче") || h == "middlename");
        var groupsIdx = headers.FindIndex(h => h.StartsWith("групп") || h == "groups");

        if (nameIdx == -1 || surnameIdx == -1 || groupsIdx == -1)
        {
            throw new InvalidOperationException("В CSV должны быть столбцы: Имя, Фамилия и Группы.");
        }

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

        var groupCache = new Dictionary<string, Group>();
        foreach (var group in await _db.Groups.ToListAsync(cancellationToken))
        {
            groupCache[NormalizeGroupName(group.Name)] = group;
        }

        var createdStudents = 0;
        var duplicateStudents = 0;
        var createdGroups = 0;
        var skippedRows = 0;

        foreach (var row in dataRows)
        {
            if (!row.Any(item => item.Trim().Length > 0))
            {
                continue;
            }

            var name = (row.ElementAtOrDefault(nameIdx) ?? string.Empty).Trim();
            var surname = (row.ElementAtOrDefault(surnameIdx) ?? string.Empty).Trim();
            var middlenameRaw = middlenameIdx == -1 ? string.Empty : (row.ElementAtOrDefault(middlenameIdx) ?? string.Empty).Trim();
            var middlename = string.IsNullOrEmpty(middlenameRaw) ? "-" : middlenameRaw;
            var groupNameRaw = (row.ElementAtOrDefault(groupsIdx) ?? string.Empty).Trim();
            var groupName = PickPrimaryGroup(groupNameRaw);

            if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(surname) || string.IsNullOrEmpty(groupName))
            {
                skippedRows++;
                continue;
            }

            var normalizedGroupName = NormalizeGroupName(groupName);
            if (!groupCache.TryGetValue(normalizedGroupName, out var group))
            {
                group = new Group { Name = groupName };
                _db.Groups.Add(group);
                await _db.SaveChangesAsync(cancellationToken);
                groupCache[normalizedGroupName] = group;
                createdGroups++;
            }

            var studentFound = await _db.Students.FirstOrDefaultAsync(
                s => s.Name == name && s.Surname == surname && s.Middlename == middlename && s.GroupId == group.Id,
                cancellationToken);

            if (studentFound is not null)
            {
                duplicateStudents++;
                continue;
            }

            _db.Students.Add(new Student { Name = name, Surname = surname, Middlename = middlename, GroupId = group.Id });
            await _db.SaveChangesAsync(cancellationToken);
            createdStudents++;
        }

        await transaction.CommitAsync(cancellationToken);

        return new ImportStudentsResult(dataRows.Count, createdStudents, duplicateStudents, createdGroups, skippedRows);
    }

    private static string DecodeCsv(byte[] buffer)
    {
        var utf8 = Encoding.UTF8.GetString(buffer).TrimStart('﻿');
        if (HasRequiredHeaders(utf8))
        {
            return utf8;
        }

        return Encoding.GetEncoding(1251).GetString(buffer).TrimStart('﻿');
    }

    private static bool HasRequiredHeaders(string content)
    {
        var firstLine = content.Split('\n', 2)[0].ToLowerInvariant();
        return firstLine.Contains("имя") && firstLine.Contains("фам");
    }

    public static List<List<string>> ParseCsv(string content)
    {
        var delimiter = DetectDelimiter(content);
        var rows = new List<List<string>>();
        var row = new List<string>();
        var field = new StringBuilder();
        var inQuotes = false;

        for (var i = 0; i < content.Length; i++)
        {
            var ch = content[i];
            var next = i + 1 < content.Length ? content[i + 1] : '\0';

            if (ch == '"')
            {
                if (inQuotes && next == '"')
                {
                    field.Append('"');
                    i++;
                }
                else
                {
                    inQuotes = !inQuotes;
                }

                continue;
            }

            if (ch == delimiter && !inQuotes)
            {
                row.Add(field.ToString().Trim());
                field.Clear();
                continue;
            }

            if ((ch == '\n' || ch == '\r') && !inQuotes)
            {
                if (ch == '\r' && next == '\n')
                {
                    i++;
                }

                row.Add(field.ToString().Trim());
                field.Clear();

                if (row.Any(v => v.Length > 0))
                {
                    rows.Add(row);
                }

                row = [];
                continue;
            }

            field.Append(ch);
        }

        if (field.Length > 0 || row.Count > 0)
        {
            row.Add(field.ToString().Trim());
            if (row.Any(v => v.Length > 0))
            {
                rows.Add(row);
            }
        }

        return rows;
    }

    private static char DetectDelimiter(string content)
    {
        var header = content.Split('\n', 2)[0];
        var commas = header.Count(c => c == ',');
        var semicolons = header.Count(c => c == ';');
        return semicolons > commas ? ';' : ',';
    }

    private static string? PickPrimaryGroup(string raw) =>
        raw.Split(';', ',').Select(i => i.Trim()).FirstOrDefault(i => i.Length > 0);

    private static string NormalizeHeader(string header) =>
        string.Join(' ', header.Trim().ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries));

    private static string NormalizeGroupName(string name) => name.Trim().ToLowerInvariant();
}
