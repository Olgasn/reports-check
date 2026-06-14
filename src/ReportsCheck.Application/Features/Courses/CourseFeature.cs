using FluentValidation;
using MediatR;
using ReportsCheck.Application.Common.Exceptions;
using ReportsCheck.Application.Common.Models;
using ReportsCheck.Application.Contracts;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Interfaces;

namespace ReportsCheck.Application.Features.Courses;

// ----- Requests -----
public record GetAllCoursesQuery : IRequest<IReadOnlyList<CourseSimpleDto>>;

public record SearchCoursesQuery(int Offset, int PageSize, string? Name) : IRequest<PaginatedResult<CourseDto>>;

public record GetCourseByIdQuery(int Id) : IRequest<CourseDto>;

public record GetCourseLabsQuery(int Id) : IRequest<IReadOnlyList<LabSimpleDto>>;

public record CreateCourseCommand(string Name, string Description) : IRequest<int>;

public record UpdateCourseCommand(int Id, string Name, string Description) : IRequest<Unit>;

public record DeleteCourseCommand(int Id) : IRequest<Unit>;

// ----- Validators -----
public class CreateCourseValidator : AbstractValidator<CreateCourseCommand>
{
    public CreateCourseValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MinimumLength(1);
        RuleFor(x => x.Description).NotEmpty().MinimumLength(1).MaximumLength(255);
    }
}

public class UpdateCourseValidator : AbstractValidator<UpdateCourseCommand>
{
    public UpdateCourseValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MinimumLength(1);
        RuleFor(x => x.Description).NotEmpty().MinimumLength(1).MaximumLength(255);
    }
}

// ----- Handlers -----
public class CourseHandlers :
    IRequestHandler<GetAllCoursesQuery, IReadOnlyList<CourseSimpleDto>>,
    IRequestHandler<SearchCoursesQuery, PaginatedResult<CourseDto>>,
    IRequestHandler<GetCourseByIdQuery, CourseDto>,
    IRequestHandler<GetCourseLabsQuery, IReadOnlyList<LabSimpleDto>>,
    IRequestHandler<CreateCourseCommand, int>,
    IRequestHandler<UpdateCourseCommand, Unit>,
    IRequestHandler<DeleteCourseCommand, Unit>
{
    private readonly IRepository<Course> _courses;
    private readonly IUnitOfWork _unitOfWork;

    public CourseHandlers(IRepository<Course> courses, IUnitOfWork unitOfWork)
    {
        _courses = courses;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CourseSimpleDto>> Handle(GetAllCoursesQuery request, CancellationToken cancellationToken)
    {
        var courses = await _courses.GetAllAsync(cancellationToken);
        return courses.Select(c => c.ToSimpleDto()).ToList();
    }

    public async Task<PaginatedResult<CourseDto>> Handle(SearchCoursesQuery request, CancellationToken cancellationToken)
    {
        var name = request.Name ?? string.Empty;
        var (items, total) = await _courses.PageAsync(
            c => c.Name.Contains(name), request.Offset, request.PageSize, cancellationToken, c => c.Prompt!);

        return new PaginatedResult<CourseDto>(items.Select(c => c.ToDto()).ToList(), total);
    }

    public async Task<CourseDto> Handle(GetCourseByIdQuery request, CancellationToken cancellationToken)
    {
        var course = await _courses.GetByIdAsync(request.Id, cancellationToken, c => c.Prompt!)
            ?? throw new NotFoundException("Курс не был найден.");
        return course.ToDto();
    }

    public async Task<IReadOnlyList<LabSimpleDto>> Handle(GetCourseLabsQuery request, CancellationToken cancellationToken)
    {
        var course = await _courses.GetByIdAsync(request.Id, cancellationToken, c => c.Labs)
            ?? throw new NotFoundException("Курс не был найден.");
        return course.Labs.Select(l => l.ToSimpleDto()).ToList();
    }

    public async Task<int> Handle(CreateCourseCommand request, CancellationToken cancellationToken)
    {
        var course = new Course { Name = request.Name, Description = request.Description };
        await _courses.AddAsync(course, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return course.Id;
    }

    public async Task<Unit> Handle(UpdateCourseCommand request, CancellationToken cancellationToken)
    {
        var course = await _courses.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Курс не был найден.");
        course.Name = request.Name;
        course.Description = request.Description;
        _courses.Update(course);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }

    public async Task<Unit> Handle(DeleteCourseCommand request, CancellationToken cancellationToken)
    {
        var course = await _courses.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Курс не был найден.");
        _courses.Delete(course);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
