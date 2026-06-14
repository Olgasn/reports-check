using FluentValidation;
using MediatR;
using ReportsCheck.Application.Common.Exceptions;
using ReportsCheck.Application.Contracts;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Interfaces;

namespace ReportsCheck.Application.Features.Providers;

public record GetProvidersQuery : IRequest<IReadOnlyList<ProviderDto>>;
public record GetProviderByIdQuery(int Id) : IRequest<ProviderDto>;
public record CreateProviderCommand(string Name, string Url) : IRequest<int>;
public record UpdateProviderCommand(int Id, string Name, string Url) : IRequest<Unit>;
public record DeleteProviderCommand(int Id) : IRequest<Unit>;

public class CreateProviderValidator : AbstractValidator<CreateProviderCommand>
{
    public CreateProviderValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MinimumLength(1);
        RuleFor(x => x.Url).NotEmpty().Must(u => Uri.TryCreate(u, UriKind.Absolute, out _))
            .WithMessage("url должен быть корректным URL.");
    }
}

public class ProviderHandlers :
    IRequestHandler<GetProvidersQuery, IReadOnlyList<ProviderDto>>,
    IRequestHandler<GetProviderByIdQuery, ProviderDto>,
    IRequestHandler<CreateProviderCommand, int>,
    IRequestHandler<UpdateProviderCommand, Unit>,
    IRequestHandler<DeleteProviderCommand, Unit>
{
    private readonly IRepository<Provider> _providers;
    private readonly IUnitOfWork _unitOfWork;

    public ProviderHandlers(IRepository<Provider> providers, IUnitOfWork unitOfWork)
    {
        _providers = providers;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<ProviderDto>> Handle(GetProvidersQuery request, CancellationToken cancellationToken) =>
        (await _providers.GetAllAsync(cancellationToken)).Select(p => p.ToDto()).ToList();

    public async Task<ProviderDto> Handle(GetProviderByIdQuery request, CancellationToken cancellationToken) =>
        (await _providers.GetByIdAsync(request.Id, cancellationToken) ?? throw new NotFoundException("Провайдер не был найден.")).ToDto();

    public async Task<int> Handle(CreateProviderCommand request, CancellationToken cancellationToken)
    {
        var provider = new Provider { Name = request.Name, Url = request.Url };
        await _providers.AddAsync(provider, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return provider.Id;
    }

    public async Task<Unit> Handle(UpdateProviderCommand request, CancellationToken cancellationToken)
    {
        var provider = await _providers.GetByIdAsync(request.Id, cancellationToken) ?? throw new NotFoundException("Провайдер не был найден.");
        provider.Name = request.Name;
        provider.Url = request.Url;
        _providers.Update(provider);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }

    public async Task<Unit> Handle(DeleteProviderCommand request, CancellationToken cancellationToken)
    {
        var provider = await _providers.GetByIdAsync(request.Id, cancellationToken) ?? throw new NotFoundException("Провайдер не был найден.");
        _providers.Delete(provider);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
