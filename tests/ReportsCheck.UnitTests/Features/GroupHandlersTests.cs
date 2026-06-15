using FluentAssertions;
using NSubstitute;
using ReportsCheck.Application.Common.Exceptions;
using ReportsCheck.Application.Features.Groups;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Interfaces;

namespace ReportsCheck.UnitTests.Features;

public class GroupHandlersTests
{
    private readonly IRepository<Group> _groups = Substitute.For<IRepository<Group>>();
    private readonly IRepository<Student> _students = Substitute.For<IRepository<Student>>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();

    private GroupHandlers CreateSut() => new(_groups, _students, _unitOfWork);

    [Fact]
    public async Task CreateGroup_AddsGroupAndSaves()
    {
        var sut = CreateSut();

        await sut.Handle(new CreateGroupCommand("Группа 1"), CancellationToken.None);

        await _groups.Received(1).AddAsync(Arg.Is<Group>(g => g.Name == "Группа 1"), Arg.Any<CancellationToken>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateGroup_UpdatesNameAndSaves()
    {
        var group = new Group { Id = 3, Name = "Старое" };
        _groups.GetByIdAsync(3, Arg.Any<CancellationToken>()).Returns(group);
        var sut = CreateSut();

        await sut.Handle(new UpdateGroupCommand(3, "Новое"), CancellationToken.None);

        group.Name.Should().Be("Новое");
        _groups.Received(1).Update(group);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateGroup_WhenNotFound_ThrowsNotFoundException()
    {
        _groups.GetByIdAsync(99, Arg.Any<CancellationToken>()).Returns((Group?)null);
        var sut = CreateSut();

        await sut.Invoking(h => h.Handle(new UpdateGroupCommand(99, "Имя"), CancellationToken.None))
            .Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task DeleteGroup_RemovesGroupAndSaves()
    {
        var group = new Group { Id = 7 };
        _groups.GetByIdAsync(7, Arg.Any<CancellationToken>()).Returns(group);
        var sut = CreateSut();

        await sut.Handle(new DeleteGroupCommand(7), CancellationToken.None);

        _groups.Received(1).Delete(group);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteGroup_WhenNotFound_ThrowsNotFoundException()
    {
        _groups.GetByIdAsync(99, Arg.Any<CancellationToken>()).Returns((Group?)null);
        var sut = CreateSut();

        await sut.Invoking(h => h.Handle(new DeleteGroupCommand(99), CancellationToken.None))
            .Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task AddGroupMember_SetsGroupIdOnStudentAndSaves()
    {
        var student = new Student { Id = 5, GroupId = null };
        _students.GetByIdAsync(5, Arg.Any<CancellationToken>()).Returns(student);
        var sut = CreateSut();

        await sut.Handle(new AddGroupMemberCommand(10, 5), CancellationToken.None);

        student.GroupId.Should().Be(10);
        _students.Received(1).Update(student);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddGroupMember_WhenStudentNotFound_ThrowsNotFoundException()
    {
        _students.GetByIdAsync(99, Arg.Any<CancellationToken>()).Returns((Student?)null);
        var sut = CreateSut();

        await sut.Invoking(h => h.Handle(new AddGroupMemberCommand(1, 99), CancellationToken.None))
            .Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task RemoveGroupMember_WhenStudentBelongsToGroup_ClearsGroupId()
    {
        var student = new Student { Id = 5, GroupId = 10 };
        _students.GetByIdAsync(5, Arg.Any<CancellationToken>()).Returns(student);
        var sut = CreateSut();

        await sut.Handle(new RemoveGroupMemberCommand(10, 5), CancellationToken.None);

        student.GroupId.Should().BeNull();
        _students.Received(1).Update(student);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveGroupMember_WhenStudentBelongsToDifferentGroup_DoesNotUpdateOrSave()
    {
        var student = new Student { Id = 5, GroupId = 20 };
        _students.GetByIdAsync(5, Arg.Any<CancellationToken>()).Returns(student);
        var sut = CreateSut();

        await sut.Handle(new RemoveGroupMemberCommand(10, 5), CancellationToken.None);

        student.GroupId.Should().Be(20);
        _students.DidNotReceive().Update(Arg.Any<Student>());
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}
