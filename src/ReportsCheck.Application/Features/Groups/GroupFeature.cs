using FluentValidation;
using MediatR;
using ReportsCheck.Application.Common.Exceptions;
using ReportsCheck.Application.Common.Models;
using ReportsCheck.Application.Contracts;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Interfaces;

namespace ReportsCheck.Application.Features.Groups;

// ----- Requests -----
public record GetGroupsQuery : IRequest<IReadOnlyList<GroupDto>>;

public record GetGroupByIdQuery(int Id) : IRequest<GroupDto>;

public record SearchGroupStudentsQuery(int Offset, int PageSize, string? Search, int GroupId) : IRequest<PaginatedResult<StudentDto>>;

public record CreateGroupCommand(string Name) : IRequest<int>;

public record UpdateGroupCommand(int Id, string Name) : IRequest<Unit>;

public record DeleteGroupCommand(int Id) : IRequest<Unit>;

public record AddGroupMemberCommand(int GroupId, int StudentId) : IRequest<Unit>;

public record RemoveGroupMemberCommand(int GroupId, int StudentId) : IRequest<Unit>;

// ----- Validators -----
public class CreateGroupValidator : AbstractValidator<CreateGroupCommand>
{
    public CreateGroupValidator() => RuleFor(x => x.Name).NotEmpty().MinimumLength(1);
}

public class UpdateGroupValidator : AbstractValidator<UpdateGroupCommand>
{
    public UpdateGroupValidator() => RuleFor(x => x.Name).NotEmpty().MinimumLength(1);
}

// ----- Handlers -----
public class GroupHandlers :
    IRequestHandler<GetGroupsQuery, IReadOnlyList<GroupDto>>,
    IRequestHandler<GetGroupByIdQuery, GroupDto>,
    IRequestHandler<SearchGroupStudentsQuery, PaginatedResult<StudentDto>>,
    IRequestHandler<CreateGroupCommand, int>,
    IRequestHandler<UpdateGroupCommand, Unit>,
    IRequestHandler<DeleteGroupCommand, Unit>,
    IRequestHandler<AddGroupMemberCommand, Unit>,
    IRequestHandler<RemoveGroupMemberCommand, Unit>
{
    private readonly IRepository<Group> _groups;
    private readonly IRepository<Student> _students;
    private readonly IUnitOfWork _unitOfWork;

    public GroupHandlers(IRepository<Group> groups, IRepository<Student> students, IUnitOfWork unitOfWork)
    {
        _groups = groups;
        _students = students;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<GroupDto>> Handle(GetGroupsQuery request, CancellationToken cancellationToken)
    {
        var groups = await _groups.GetAllAsync(cancellationToken);
        return groups.Select(g => g.ToDto()).ToList();
    }

    public async Task<GroupDto> Handle(GetGroupByIdQuery request, CancellationToken cancellationToken)
    {
        var group = await _groups.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Группа не была найдена.");
        return group.ToDto();
    }

    public async Task<PaginatedResult<StudentDto>> Handle(SearchGroupStudentsQuery request, CancellationToken cancellationToken)
    {
        var search = request.Search ?? string.Empty;
        var (items, total) = await _students.PageAsync(
            s => s.GroupId == request.GroupId && s.Surname.Contains(search),
            request.Offset, request.PageSize, cancellationToken, s => s.Group!);

        return new PaginatedResult<StudentDto>(items.Select(s => s.ToDto()).ToList(), total);
    }

    public async Task<int> Handle(CreateGroupCommand request, CancellationToken cancellationToken)
    {
        var group = new Group { Name = request.Name };
        await _groups.AddAsync(group, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return group.Id;
    }

    public async Task<Unit> Handle(UpdateGroupCommand request, CancellationToken cancellationToken)
    {
        var group = await _groups.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Группа не была найдена.");
        group.Name = request.Name;
        _groups.Update(group);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }

    public async Task<Unit> Handle(DeleteGroupCommand request, CancellationToken cancellationToken)
    {
        var group = await _groups.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Группа не была найдена.");
        _groups.Delete(group);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }

    public async Task<Unit> Handle(AddGroupMemberCommand request, CancellationToken cancellationToken)
    {
        var student = await _students.GetByIdAsync(request.StudentId, cancellationToken)
            ?? throw new NotFoundException("Студент не был найден.");
        student.GroupId = request.GroupId;
        _students.Update(student);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }

    public async Task<Unit> Handle(RemoveGroupMemberCommand request, CancellationToken cancellationToken)
    {
        var student = await _students.GetByIdAsync(request.StudentId, cancellationToken)
            ?? throw new NotFoundException("Студент не был найден.");
        if (student.GroupId == request.GroupId)
        {
            student.GroupId = null;
            _students.Update(student);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        return Unit.Value;
    }
}
