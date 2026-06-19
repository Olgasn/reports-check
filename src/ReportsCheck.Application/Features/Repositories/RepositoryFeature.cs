using FluentValidation;
using MediatR;
using ReportsCheck.Application.Common.Exceptions;
using ReportsCheck.Application.Contracts;
using ReportsCheck.Application.GitHub;
using ReportsCheck.Application.Provisioning;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Interfaces;

namespace ReportsCheck.Application.Features.Repositories;

// ----- Requests -----
public record EnqueueCreateRepositoriesCommand(int CourseId, int GroupId, IReadOnlyList<int> StudentIds) : IRequest<Unit>;

public record EnqueueSendInvitationsCommand(int CourseId, int GroupId, IReadOnlyList<int> StudentIds) : IRequest<Unit>;

public record GetRepositoriesQuery(int CourseId, int GroupId) : IRequest<IReadOnlyList<StudentRepositoryDto>>;

public record DeleteRepositoryCommand(int Id) : IRequest<Unit>;

// ----- Validators -----
public class EnqueueCreateRepositoriesValidator : AbstractValidator<EnqueueCreateRepositoriesCommand>
{
    public EnqueueCreateRepositoriesValidator()
    {
        RuleFor(x => x.CourseId).GreaterThan(0);
        RuleFor(x => x.GroupId).GreaterThan(0);
    }
}

public class EnqueueSendInvitationsValidator : AbstractValidator<EnqueueSendInvitationsCommand>
{
    public EnqueueSendInvitationsValidator()
    {
        RuleFor(x => x.CourseId).GreaterThan(0);
        RuleFor(x => x.GroupId).GreaterThan(0);
    }
}

// ----- Handlers -----
public class RepositoryHandlers :
    IRequestHandler<EnqueueCreateRepositoriesCommand, Unit>,
    IRequestHandler<EnqueueSendInvitationsCommand, Unit>,
    IRequestHandler<GetRepositoriesQuery, IReadOnlyList<StudentRepositoryDto>>,
    IRequestHandler<DeleteRepositoryCommand, Unit>
{
    private readonly IProvisioningQueue _queue;
    private readonly IRepository<StudentRepository> _repositories;
    private readonly IGitHubRepositoryService _github;
    private readonly IUnitOfWork _unitOfWork;

    public RepositoryHandlers(
        IProvisioningQueue queue,
        IRepository<StudentRepository> repositories,
        IGitHubRepositoryService github,
        IUnitOfWork unitOfWork)
    {
        _queue = queue;
        _repositories = repositories;
        _github = github;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(EnqueueCreateRepositoriesCommand request, CancellationToken cancellationToken)
    {
        await _queue.EnqueueAsync(new ProvisioningJob
        {
            Kind = ProvisioningJobKind.CreateRepos,
            CourseId = request.CourseId,
            GroupId = request.GroupId,
            StudentIds = request.StudentIds,
        }, cancellationToken);
        return Unit.Value;
    }

    public async Task<Unit> Handle(EnqueueSendInvitationsCommand request, CancellationToken cancellationToken)
    {
        await _queue.EnqueueAsync(new ProvisioningJob
        {
            Kind = ProvisioningJobKind.SendInvitations,
            CourseId = request.CourseId,
            GroupId = request.GroupId,
            StudentIds = request.StudentIds,
        }, cancellationToken);
        return Unit.Value;
    }

    public async Task<IReadOnlyList<StudentRepositoryDto>> Handle(GetRepositoriesQuery request, CancellationToken cancellationToken)
    {
        var repositories = await _repositories.FindAsync(
            r => r.CourseId == request.CourseId && r.Student.GroupId == request.GroupId,
            cancellationToken,
            r => r.Student);

        return repositories
            .OrderBy(r => r.Student.Number)
            .ThenBy(r => r.Student.Surname)
            .Select(r => r.ToDto())
            .ToList();
    }

    public async Task<Unit> Handle(DeleteRepositoryCommand request, CancellationToken cancellationToken)
    {
        var repository = await _repositories.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Репозиторий не был найден.");

        if (!string.IsNullOrWhiteSpace(repository.Name))
        {
            await _github.DeleteRepositoryAsync(repository.Name, cancellationToken);
        }

        _repositories.Delete(repository);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
