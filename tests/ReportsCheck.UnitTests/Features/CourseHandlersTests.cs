using FluentAssertions;
using NSubstitute;
using ReportsCheck.Application.Features.Courses;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Interfaces;
using Xunit;

namespace ReportsCheck.UnitTests.Features;

public class CourseHandlersTests
{
    private readonly IRepository<Course> _courses = Substitute.For<IRepository<Course>>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();

    private CourseHandlers CreateSut() => new(_courses, _unitOfWork);

    [Fact]
    public async Task CreateCourse_AddsCourseAndSaves()
    {
        var sut = CreateSut();

        await sut.Handle(new CreateCourseCommand("Курс", "Описание"), CancellationToken.None);

        await _courses.Received(1).AddAsync(Arg.Is<Course>(c => c.Name == "Курс" && c.Description == "Описание"), Arg.Any<CancellationToken>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteCourse_RemovesCourseAndSaves()
    {
        var course = new Course { Id = 5, Name = "Курс" };
        _courses.GetByIdAsync(5, Arg.Any<CancellationToken>()).Returns(course);
        var sut = CreateSut();

        await sut.Handle(new DeleteCourseCommand(5), CancellationToken.None);

        _courses.Received(1).Delete(course);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}
