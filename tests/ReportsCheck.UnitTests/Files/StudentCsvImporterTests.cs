using System.Text;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using ReportsCheck.Infrastructure.Files;
using ReportsCheck.Infrastructure.Persistence;
using Xunit;

namespace ReportsCheck.UnitTests.Files;

public class StudentCsvImporterTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly AppDbContext _db;

    public StudentCsvImporterTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;
        _db = new AppDbContext(options);
        _db.Database.EnsureCreated();
    }

    [Fact]
    public async Task ImportAsync_WithEmailColumn_SavesEmail()
    {
        const string csv = "Фамилия;Имя;Отчество;Email;Группы\nИванов;Иван;Иванович;ivanov@example.com;ИУ7";
        var importer = new StudentCsvImporter(_db);

        var result = await importer.ImportAsync(Encoding.UTF8.GetBytes(csv), CancellationToken.None);

        result.CreatedStudents.Should().Be(1);
        var student = await _db.Students.SingleAsync(CancellationToken.None);
        student.Email.Should().Be("ivanov@example.com");
    }

    [Fact]
    public async Task ImportAsync_WithoutEmailColumn_LeavesEmailNull()
    {
        const string csv = "Фамилия;Имя;Группы\nПетров;Пётр;ИУ7";
        var importer = new StudentCsvImporter(_db);

        await importer.ImportAsync(Encoding.UTF8.GetBytes(csv), CancellationToken.None);

        var student = await _db.Students.SingleAsync(CancellationToken.None);
        student.Email.Should().BeNull();
    }

    [Fact]
    public async Task ImportAsync_DuplicateWithEmail_BackfillsMissingEmail()
    {
        const string first = "Фамилия;Имя;Отчество;Группы\nСидоров;Сидор;Сидорович;ИУ7";
        const string second = "Фамилия;Имя;Отчество;Email;Группы\nСидоров;Сидор;Сидорович;sidorov@example.com;ИУ7";
        var importer = new StudentCsvImporter(_db);

        await importer.ImportAsync(Encoding.UTF8.GetBytes(first), CancellationToken.None);
        var result = await importer.ImportAsync(Encoding.UTF8.GetBytes(second), CancellationToken.None);

        result.DuplicateStudents.Should().Be(1);
        var student = await _db.Students.SingleAsync(CancellationToken.None);
        student.Email.Should().Be("sidorov@example.com");
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }
}
