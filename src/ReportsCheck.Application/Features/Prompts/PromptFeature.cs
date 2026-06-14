using FluentValidation;
using MediatR;
using ReportsCheck.Application.Common.Exceptions;
using ReportsCheck.Application.Contracts;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Interfaces;

namespace ReportsCheck.Application.Features.Prompts;

public record GetPromptsQuery : IRequest<IReadOnlyList<PromptDto>>;
public record CreatePromptCommand(string Content, int CourseId) : IRequest<int>;
public record UpdatePromptCommand(int Id, string Content, int? CourseId) : IRequest<Unit>;
public record DeletePromptCommand(int Id) : IRequest<Unit>;

public class CreatePromptValidator : AbstractValidator<CreatePromptCommand>
{
    public CreatePromptValidator()
    {
        RuleFor(x => x.Content).NotNull();
        RuleFor(x => x.CourseId).GreaterThan(0);
    }
}

public class PromptHandlers :
    IRequestHandler<GetPromptsQuery, IReadOnlyList<PromptDto>>,
    IRequestHandler<CreatePromptCommand, int>,
    IRequestHandler<UpdatePromptCommand, Unit>,
    IRequestHandler<DeletePromptCommand, Unit>
{
    private readonly IRepository<Prompt> _prompts;
    private readonly IUnitOfWork _unitOfWork;

    public PromptHandlers(IRepository<Prompt> prompts, IUnitOfWork unitOfWork)
    {
        _prompts = prompts;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<PromptDto>> Handle(GetPromptsQuery request, CancellationToken cancellationToken) =>
        (await _prompts.GetAllAsync(cancellationToken)).Select(p => p.ToDto()).ToList();

    public async Task<int> Handle(CreatePromptCommand request, CancellationToken cancellationToken)
    {
        var prompt = new Prompt { Content = request.Content, CourseId = request.CourseId };
        await _prompts.AddAsync(prompt, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return prompt.Id;
    }

    public async Task<Unit> Handle(UpdatePromptCommand request, CancellationToken cancellationToken)
    {
        var prompt = await _prompts.GetByIdAsync(request.Id, cancellationToken) ?? throw new NotFoundException("Промпт не был найден.");
        prompt.Content = request.Content;
        if (request.CourseId is not null)
        {
            prompt.CourseId = request.CourseId.Value;
        }
        _prompts.Update(prompt);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }

    public async Task<Unit> Handle(DeletePromptCommand request, CancellationToken cancellationToken)
    {
        var prompt = await _prompts.GetByIdAsync(request.Id, cancellationToken) ?? throw new NotFoundException("Промпт не был найден.");
        _prompts.Delete(prompt);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
