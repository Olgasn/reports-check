using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using ReportsCheck.Application.Reports;
using ReportsCheck.Application.Reports.Validators;
using Xunit;

namespace ReportsCheck.UnitTests.Reports;

public class ModelResultExtractorTests
{
    private readonly ModelResultExtractor _extractor = new(
        new ModelCheckResultValidator(),
        NullLogger<ModelResultExtractor>.Instance);

    [Fact]
    public void Extract_ValidJson_ReturnsParsedResult()
    {
        const string content = """
        Вот результат:
        <JSON>
        {
            "grade": 8,
            "review": "Хорошая работа",
            "advantages": ["Чёткая структура"],
            "disadvantages": ["Нет выводов"]
        }
        </JSON>
        """;

        var result = _extractor.Extract(content);

        result.Grade.Should().Be(8);
        result.Review.Should().Be("Хорошая работа");
        result.Advantages.Should().ContainSingle().Which.Should().Be("Чёткая структура");
    }

    [Fact]
    public void Extract_WithTrailingCommas_RecoversViaFallback()
    {
        const string content = """
        <JSON>
        {
            "grade": 7,
            "review": "ok",
            "advantages": ["a",],
            "disadvantages": ["b",],
        }
        </JSON>
        """;

        var result = _extractor.Extract(content);

        result.Grade.Should().Be(7);
        result.Advantages.Should().ContainSingle();
    }

    [Fact]
    public void Extract_WithRawControlCharsInStrings_RecoversViaFallback()
    {
        var content = "<JSON>\n{\n\"grade\": 6,\n\"review\": \"line1\nline2\",\n\"advantages\": [\"a\"],\n\"disadvantages\": []\n}\n</JSON>";

        var result = _extractor.Extract(content);

        result.Grade.Should().Be(6);
        result.Review.Should().Contain("line1");
    }

    [Fact]
    public void Extract_StripsJsonFence()
    {
        const string content = """
        <JSON>
        ```json
        { "grade": 9, "review": "r", "advantages": ["a"], "disadvantages": [] }
        ```
        </JSON>
        """;

        var result = _extractor.Extract(content);

        result.Grade.Should().Be(9);
    }

    [Fact]
    public void Extract_NoJsonBlock_Throws()
    {
        var act = () => _extractor.Extract("no markers here");

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Extract_GradeOutOfRange_ThrowsValidation()
    {
        const string content = """
        <JSON>
        { "grade": 11, "review": "r", "advantages": ["a"], "disadvantages": [] }
        </JSON>
        """;

        var act = () => _extractor.Extract(content);

        act.Should().Throw<InvalidOperationException>().WithMessage("*Validation*");
    }

    [Fact]
    public void Extract_EmptyAdvantages_ThrowsValidation()
    {
        const string content = """
        <JSON>
        { "grade": 5, "review": "r", "advantages": [], "disadvantages": [] }
        </JSON>
        """;

        var act = () => _extractor.Extract(content);

        act.Should().Throw<InvalidOperationException>().WithMessage("*Validation*");
    }
}
