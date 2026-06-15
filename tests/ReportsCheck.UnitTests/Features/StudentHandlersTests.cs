using FluentAssertions;
using NSubstitute;
using ReportsCheck.Application.Common.Exceptions;
using ReportsCheck.Application.Features.Students;
using ReportsCheck.Application.Files;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Interfaces;

namespace ReportsCheck.UnitTests.Features;

public class StudentHandlersTests
{
    private readonly IRepository<Student> _students = Substitute.For<IRepository<Student>>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();
    private readonly IStudentCsvImporter _csvImporter = Substitute.For<IStudentCsvImporter>();

    private StudentHandlers CreateSut() => new(_students, _unitOfWork, _csvImporter);

    [Fact]
    public async Task CreateStudent_AddsStudentAndSaves()
    {
        var sut = CreateSut();

        await sut.Handle(new CreateStudentCommand("Иван", "Иванов", "Иванович", 1), CancellationToken.None);

        await _students.Received(1).AddAsync(
            Arg.Is<Student>(s => s.Name == "Иван" && s.Surname == "Иванов" && s.Middlename == "Иванович" && s.GroupId == 1),
            Arg.Any<CancellationToken>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateStudent_UpdatesAllFieldsAndSaves()
    {
        var student = new Student { Id = 2, Name = "Старое", Surname = "Фамилия", Middlename = "Отч" };
        _students.GetByIdAsync(2, Arg.Any<CancellationToken>()).Returns(student);
        var sut = CreateSut();

        await sut.Handle(new UpdateStudentCommand(2, "Новое", "Новая", "Новович", null), CancellationToken.None);

        student.Name.Should().Be("Новое");
        student.Surname.Should().Be("Новая");
        student.Middlename.Should().Be("Новович");
        _students.Received(1).Update(student);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateStudent_WhenGroupIdProvided_UpdatesGroupId()
    {
        var student = new Student { Id = 3, GroupId = 1 };
        _students.GetByIdAsync(3, Arg.Any<CancellationToken>()).Returns(student);
        var sut = CreateSut();

        await sut.Handle(new UpdateStudentCommand(3, "Имя", "Фам", "Отч", 5), CancellationToken.None);

        student.GroupId.Should().Be(5);
    }

    [Fact]
    public async Task UpdateStudent_WhenGroupIdNull_KeepsExistingGroupId()
    {
        var student = new Student { Id = 3, GroupId = 7 };
        _students.GetByIdAsync(3, Arg.Any<CancellationToken>()).Returns(student);
        var sut = CreateSut();

        await sut.Handle(new UpdateStudentCommand(3, "Имя", "Фам", "Отч", null), CancellationToken.None);

        student.GroupId.Should().Be(7);
    }

    [Fact]
    public async Task DeleteStudent_RemovesStudentAndSaves()
    {
        var student = new Student { Id = 9 };
        _students.GetByIdAsync(9, Arg.Any<CancellationToken>()).Returns(student);
        var sut = CreateSut();

        await sut.Handle(new DeleteStudentCommand(9), CancellationToken.None);

        _students.Received(1).Delete(student);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteStudent_WhenNotFound_ThrowsNotFoundException()
    {
        _students.GetByIdAsync(99, Arg.Any<CancellationToken>()).Returns((Student?)null);
        var sut = CreateSut();

        await sut.Invoking(h => h.Handle(new DeleteStudentCommand(99), CancellationToken.None))
            .Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task ImportStudentsCsv_DelegatesToCsvImporter()
    {
        var expected = new ImportStudentsResult(10, 8, 2, 1, 0);
        _csvImporter.ImportAsync(Arg.Any<byte[]>(), Arg.Any<CancellationToken>()).Returns(expected);
        var sut = CreateSut();

        var result = await sut.Handle(new ImportStudentsCsvCommand([1, 2, 3]), CancellationToken.None);

        result.Should().Be(expected);
        await _csvImporter.Received(1).ImportAsync(Arg.Any<byte[]>(), Arg.Any<CancellationToken>());
    }
}
