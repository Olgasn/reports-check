namespace ReportsCheck.Application.Reports.Models;

/// <summary>
/// Отчёт студента, извлечённый из архива/файла. Порт ReportCheck (типа данных).
/// </summary>
public record ParsedReport(string Name, string Surname, string Middlename, string Num, string Content);

/// <summary>
/// Студент, распознанный по имени файла/папки (до выбора пользователем).
/// Порт StudentParsedDto.
/// </summary>
public record ParsedStudent(string Name, string Surname, string Middlename, string Id);
