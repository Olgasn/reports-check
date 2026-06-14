using FluentValidation;
using MediatR;
using ReportsCheck.Application.Common.Exceptions;
using ReportsCheck.Application.Contracts;
using ReportsCheck.Application.Files;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Interfaces;

namespace ReportsCheck.Application.Features.Labs;

// ----- Requests -----
public record GetLabsQuery : IRequest<IReadOnlyList<LabDto>>;

public record GetLabByIdQuery(int Id) : IRequest<LabDto>;

public record CreateLabCommand(string Name, string Description, int CourseId, string FileName, byte[] FileContent) : IRequest<int>;

public record UpdateLabCommand(int Id, string? Name, string? Description, string? FileName, byte[]? FileContent) : IRequest<Unit>;

public record DeleteLabCommand(int Id) : IRequest<Unit>;

// ----- Validators -----
public class CreateLabValidator : AbstractValidator<CreateLabCommand>
{
    public CreateLabValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MinimumLength(1);
        RuleFor(x => x.CourseId).GreaterThan(0);
        RuleFor(x => x.FileContent).NotNull();
    }
}

// ----- Handlers -----
public class LabHandlers :
    IRequestHandler<GetLabsQuery, IReadOnlyList<LabDto>>,
    IRequestHandler<GetLabByIdQuery, LabDto>,
    IRequestHandler<CreateLabCommand, int>,
    IRequestHandler<UpdateLabCommand, Unit>,
    IRequestHandler<DeleteLabCommand, Unit>
{
    private readonly IRepository<Lab> _labs;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDocumentTextExtractor _textExtractor;

    public LabHandlers(IRepository<Lab> labs, IUnitOfWork unitOfWork, IDocumentTextExtractor textExtractor)
    {
        _labs = labs;
        _unitOfWork = unitOfWork;
        _textExtractor = textExtractor;
    }

    public async Task<IReadOnlyList<LabDto>> Handle(GetLabsQuery request, CancellationToken cancellationToken)
    {
        var labs = await _labs.GetAllAsync(cancellationToken);
        return labs.Select(l => l.ToDto()).ToList();
    }

    public async Task<LabDto> Handle(GetLabByIdQuery request, CancellationToken cancellationToken)
    {
        var lab = await _labs.GetByIdAsync(request.Id, cancellationToken, l => l.Course)
            ?? throw new NotFoundException("Лабораторная работа не была найдена.");
        return lab.ToDto();
    }

    public async Task<int> Handle(CreateLabCommand request, CancellationToken cancellationToken)
    {
        var content = await _textExtractor.ExtractTextAsync(request.FileName, request.FileContent, cancellationToken);
        var lab = new Lab
        {
            Name = request.Name,
            Description = request.Description,
            CourseId = request.CourseId,
            Filename = request.FileName,
            Filesize = request.FileContent.Length,
            Content = content,
        };
        await _labs.AddAsync(lab, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return lab.Id;
    }

    public async Task<Unit> Handle(UpdateLabCommand request, CancellationToken cancellationToken)
    {
        var lab = await _labs.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Лабораторная работа не была найдена.");

        if (request.Name is not null) lab.Name = request.Name;
        if (request.Description is not null) lab.Description = request.Description;

        if (request.FileContent is not null && request.FileName is not null)
        {
            lab.Filename = request.FileName;
            lab.Filesize = request.FileContent.Length;
            lab.Content = await _textExtractor.ExtractTextAsync(request.FileName, request.FileContent, cancellationToken);
        }

        _labs.Update(lab);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }

    public async Task<Unit> Handle(DeleteLabCommand request, CancellationToken cancellationToken)
    {
        var lab = await _labs.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Лабораторная работа не была найдена.");
        _labs.Delete(lab);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
