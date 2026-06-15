using FluentAssertions;
using ReportsCheck.Application.Reports;
using ReportsCheck.Application.Reports.Models;

namespace ReportsCheck.UnitTests.Reports;

public class ReportStudentMatchTests
{
    private static ParsedReport MakeReport(string name, string surname, string middlename) =>
        new(name, surname, middlename, "1", "содержимое");

    private static ParsedStudent MakeStudent(string name, string surname, string middlename) =>
        new(name, surname, middlename, "id");

    [Fact]
    public void IsSimilar_WhenAllFieldsMatch_ReturnsTrue()
    {
        var report = MakeReport("Иван", "Иванов", "Иванович");
        var student = MakeStudent("Иван", "Иванов", "Иванович");

        ReportStudentMatch.IsSimilar(report, student).Should().BeTrue();
    }

    [Fact]
    public void IsSimilar_WhenNameDiffers_ReturnsFalse()
    {
        var report = MakeReport("Иван", "Иванов", "Иванович");
        var student = MakeStudent("Пётр", "Иванов", "Иванович");

        ReportStudentMatch.IsSimilar(report, student).Should().BeFalse();
    }

    [Fact]
    public void IsSimilar_WhenSurnameDiffers_ReturnsFalse()
    {
        var report = MakeReport("Иван", "Иванов", "Иванович");
        var student = MakeStudent("Иван", "Петров", "Иванович");

        ReportStudentMatch.IsSimilar(report, student).Should().BeFalse();
    }

    [Fact]
    public void IsSimilar_WhenMiddlenameDiffers_ReturnsFalse()
    {
        var report = MakeReport("Иван", "Иванов", "Иванович");
        var student = MakeStudent("Иван", "Иванов", "Петрович");

        ReportStudentMatch.IsSimilar(report, student).Should().BeFalse();
    }
}
