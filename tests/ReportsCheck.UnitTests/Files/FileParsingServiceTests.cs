using System.IO.Compression;
using System.Text;
using FluentAssertions;
using NSubstitute;
using ReportsCheck.Application.Files;
using ReportsCheck.Application.Reports.Models;
using ReportsCheck.Infrastructure.Files;

namespace ReportsCheck.UnitTests.Files;

public class FileParsingServiceTests
{
    private readonly IDocumentTextExtractor _extractor = Substitute.For<IDocumentTextExtractor>();

    private FileParsingService CreateSut() => new(_extractor);

    private static byte[] BuildZip(IEnumerable<(string EntryPath, string Content)> entries)
    {
        using var ms = new MemoryStream();
        using (var zip = new ZipArchive(ms, ZipArchiveMode.Create, leaveOpen: true))
        {
            foreach (var (path, content) in entries)
            {
                var entry = zip.CreateEntry(path);
                using var writer = new StreamWriter(entry.Open(), Encoding.UTF8);
                writer.Write(content);
            }
        }
        return ms.ToArray();
    }

    // ----- ParseStudentsFromArchiveAsync -----

    [Fact]
    public async Task ParseStudentsFromArchiveAsync_ExtractsNamesFromMoodleFolderEntries()
    {
        var zip = BuildZip([
            ("Иванов Иван Иванович_12345/отчёт.txt", "содержимое"),
            ("Петров Пётр Петрович_67890/отчёт.txt", "другое"),
        ]);

        var result = await CreateSut().ParseStudentsFromArchiveAsync(zip, TestContext.Current.CancellationToken);

        result.Should().HaveCount(2);
        result.Should().Contain(s => s.Surname == "Иванов" && s.Name == "Иван" && s.Middlename == "Иванович");
        result.Should().Contain(s => s.Surname == "Петров" && s.Name == "Пётр" && s.Middlename == "Петрович");
    }

    [Fact]
    public async Task ParseStudentsFromArchiveAsync_IgnoresDirectoryEntries()
    {
        var zip = BuildZip([
            ("Иванов Иван Иванович_1/отчёт.txt", "текст"),
        ]);

        var result = await CreateSut().ParseStudentsFromArchiveAsync(zip, TestContext.Current.CancellationToken);

        // Only the file entry is parsed (the folder marker entry has empty Name)
        result.Should().HaveCount(1);
    }

    // ----- ParseArchiveAsync -----

    [Fact]
    public async Task ParseArchiveAsync_ExtractsReportContent()
    {
        _extractor.ExtractTextAsync("отчёт.pdf", Arg.Any<byte[]>(), Arg.Any<CancellationToken>())
            .Returns("текст отчёта");
        var zip = BuildZip([
            ("Иванов Иван Иванович_001/отчёт.pdf", "pdf bytes"),
        ]);

        var result = await CreateSut().ParseArchiveAsync(zip, TestContext.Current.CancellationToken);

        result.Should().HaveCount(1);
        var report = result[0];
        report.Surname.Should().Be("Иванов");
        report.Name.Should().Be("Иван");
        report.Middlename.Should().Be("Иванович");
        report.Num.Should().Be("001");
        report.Content.Should().Be("текст отчёта");
    }

    [Fact]
    public async Task ParseArchiveAsync_SkipsFoldersWithNoSupportedFile()
    {
        _extractor.ExtractTextAsync(Arg.Any<string>(), Arg.Any<byte[]>(), Arg.Any<CancellationToken>())
            .Returns("text");
        var zip = BuildZip([
            ("Иванов Иван Иванович_1/readme.txt", "игнорируем"),
        ]);

        var result = await CreateSut().ParseArchiveAsync(zip, TestContext.Current.CancellationToken);

        result.Should().BeEmpty();
    }

    // ----- ParseSingleReportAsync -----

    [Fact]
    public async Task ParseSingleReportAsync_WhenStudentProvided_UsesProvidedStudentName()
    {
        _extractor.ExtractTextAsync(Arg.Any<string>(), Arg.Any<byte[]>(), Arg.Any<CancellationToken>())
            .Returns("текст");
        var student = new ParsedStudent("Иван", "Иванов", "Иванович", "42");

        var result = await CreateSut().ParseSingleReportAsync("отчёт.pdf", [1], student, TestContext.Current.CancellationToken);

        result.Should().HaveCount(1);
        result[0].Name.Should().Be("Иван");
        result[0].Surname.Should().Be("Иванов");
    }

    [Fact]
    public async Task ParseSingleReportAsync_WhenNoStudent_ParsesNameFromFilename()
    {
        _extractor.ExtractTextAsync(Arg.Any<string>(), Arg.Any<byte[]>(), Arg.Any<CancellationToken>())
            .Returns("текст");

        var result = await CreateSut().ParseSingleReportAsync("Петров Пётр Петрович_2024.txt", [1], null, TestContext.Current.CancellationToken);

        result.Should().HaveCount(1);
        result[0].Surname.Should().Be("Петров");
        result[0].Name.Should().Be("Пётр");
        result[0].Middlename.Should().Be("Петрович");
    }

    [Fact]
    public async Task ParseSingleReportAsync_UnsupportedExtension_ThrowsInvalidOperationException()
    {
        var sut = CreateSut();

        await sut.Invoking(s => s.ParseSingleReportAsync("отчёт.xlsx", [1], null, TestContext.Current.CancellationToken))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*поддерживает*");
    }

    [Fact]
    public async Task ParseSingleReportAsync_FilenameWithoutMiddlename_ThrowsInvalidOperationException()
    {
        var sut = CreateSut();

        await sut.Invoking(s => s.ParseSingleReportAsync("Иванов Иван_1.txt", [1], null, TestContext.Current.CancellationToken))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Фамилия Имя Отчество*");
    }
}
