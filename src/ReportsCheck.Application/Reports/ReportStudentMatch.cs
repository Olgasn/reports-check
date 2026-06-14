using ReportsCheck.Application.Reports.Models;

namespace ReportsCheck.Application.Reports;

/// <summary>Порт isSimilarStudents.</summary>
public static class ReportStudentMatch
{
    public static bool IsSimilar(ParsedReport report, ParsedStudent student) =>
        report.Name == student.Name && report.Surname == student.Surname && report.Middlename == student.Middlename;
}
