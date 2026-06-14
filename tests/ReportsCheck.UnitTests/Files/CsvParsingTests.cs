using FluentAssertions;
using ReportsCheck.Infrastructure.Files;
using Xunit;

namespace ReportsCheck.UnitTests.Files;

public class CsvParsingTests
{
    [Fact]
    public void ParseCsv_SemicolonDelimiter_SplitsColumns()
    {
        const string content = "Фамилия;Имя;Группы\nИванов;Иван;ИУ7";

        var rows = StudentCsvImporter.ParseCsv(content);

        rows.Should().HaveCount(2);
        rows[1].Should().Equal("Иванов", "Иван", "ИУ7");
    }

    [Fact]
    public void ParseCsv_QuotedFieldWithDelimiter_IsPreserved()
    {
        const string content = "Фамилия,Имя,Группы\n\"Иванов, мл.\",Иван,ИУ7";

        var rows = StudentCsvImporter.ParseCsv(content);

        rows[1][0].Should().Be("Иванов, мл.");
        rows[1][2].Should().Be("ИУ7");
    }
}
