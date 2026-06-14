using FluentValidation;
using MediatR;
using ReportsCheck.Application.Common.Exceptions;
using ReportsCheck.Application.Contracts;
using ReportsCheck.Application.Files;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Interfaces;

namespace ReportsCheck.Application.Features.Students;

// ----- Requests -----
public record GetStudentsQuery : IRequest<IReadOnlyList<StudentDto>>;

public record GetStudentByIdQuery(int Id) : IRequest<StudentDto>;

public record CreateStudentCommand(string Name, string Surname, string Middlename, int GroupId) : IRequest<int>;

public record UpdateStudentCommand(int Id, string Name, string Surname, string Middlename, int? GroupId) : IRequest<Unit>;

public record DeleteStudentCommand(int Id) : IRequest<Unit>;

public record ImportStudentsCsvCommand(byte[] CsvContent) : IRequest<ImportStudentsResult>;

// ----- Validators -----
public class CreateStudentValidator : AbstractValidator<CreateStudentCommand>
{
    public CreateStudentValidator()
    {
        RuleFor(x => x.Name).NotNull();
        RuleFor(x => x.Surname).NotNull();
        RuleFor(x => x.Middlename).NotNull();
        RuleFor(x => x.GroupId).GreaterThan(0);
    }
}

// ----- Handlers -----
public class StudentHandlers :
    IRequestHandler<GetStudentsQuery, IReadOnlyList<StudentDto>>,
    IRequestHandler<GetStudentByIdQuery, StudentDto>,
    IRequestHandler<CreateStudentCommand, int>,
    IRequestHandler<UpdateStudentCommand, Unit>,
    IRequestHandler<DeleteStudentCommand, Unit>,
    IRequestHandler<ImportStudentsCsvCommand, ImportStudentsResult>
{
    private readonly IRepository<Student> _students;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IStudentCsvImporter _csvImporter;

    public StudentHandlers(IRepository<Student> students, IUnitOfWork unitOfWork, IStudentCsvImporter csvImporter)
    {
        _students = students;
        _unitOfWork = unitOfWork;
        _csvImporter = csvImporter;
    }

    public async Task<IReadOnlyList<StudentDto>> Handle(GetStudentsQuery request, CancellationToken cancellationToken)
    {
        var students = await _students.GetAllAsync(cancellationToken, s => s.Group!);
        return students.Select(s => s.ToDto()).ToList();
    }

    public async Task<StudentDto> Handle(GetStudentByIdQuery request, CancellationToken cancellationToken)
    {
        var student = await _students.GetByIdAsync(request.Id, cancellationToken, s => s.Group!)
            ?? throw new NotFoundException("Студент не был найден.");
        return student.ToDto();
    }

    public async Task<int> Handle(CreateStudentCommand request, CancellationToken cancellationToken)
    {
        var student = new Student
        {
            Name = request.Name,
            Surname = request.Surname,
            Middlename = request.Middlename,
            GroupId = request.GroupId,
        };
        await _students.AddAsync(student, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return student.Id;
    }

    public async Task<Unit> Handle(UpdateStudentCommand request, CancellationToken cancellationToken)
    {
        var student = await _students.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Студент не был найден.");
        student.Name = request.Name;
        student.Surname = request.Surname;
        student.Middlename = request.Middlename;
        if (request.GroupId is not null)
        {
            student.GroupId = request.GroupId;
        }
        _students.Update(student);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }

    public async Task<Unit> Handle(DeleteStudentCommand request, CancellationToken cancellationToken)
    {
        var student = await _students.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Студент не был найден.");
        _students.Delete(student);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }

    public Task<ImportStudentsResult> Handle(ImportStudentsCsvCommand request, CancellationToken cancellationToken) =>
        _csvImporter.ImportAsync(request.CsvContent, cancellationToken);
}
