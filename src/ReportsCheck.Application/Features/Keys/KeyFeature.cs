using FluentValidation;
using MediatR;
using ReportsCheck.Application.Common.Exceptions;
using ReportsCheck.Application.Contracts;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Interfaces;

namespace ReportsCheck.Application.Features.Keys;

public record GetKeysQuery : IRequest<IReadOnlyList<KeyDto>>;
public record GetKeyByIdQuery(int Id) : IRequest<KeyDto>;
public record CreateKeyCommand(string Name, string Value) : IRequest<int>;
public record UpdateKeyCommand(int Id, string Name, string Value) : IRequest<Unit>;
public record DeleteKeyCommand(int Id) : IRequest<Unit>;

public class CreateKeyValidator : AbstractValidator<CreateKeyCommand>
{
    public CreateKeyValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MinimumLength(1);
        RuleFor(x => x.Value).NotEmpty().MinimumLength(1);
    }
}

public class KeyHandlers :
    IRequestHandler<GetKeysQuery, IReadOnlyList<KeyDto>>,
    IRequestHandler<GetKeyByIdQuery, KeyDto>,
    IRequestHandler<CreateKeyCommand, int>,
    IRequestHandler<UpdateKeyCommand, Unit>,
    IRequestHandler<DeleteKeyCommand, Unit>
{
    private readonly IRepository<Key> _keys;
    private readonly IUnitOfWork _unitOfWork;

    public KeyHandlers(IRepository<Key> keys, IUnitOfWork unitOfWork)
    {
        _keys = keys;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<KeyDto>> Handle(GetKeysQuery request, CancellationToken cancellationToken) =>
        (await _keys.GetAllAsync(cancellationToken)).Select(k => k.ToDto()).ToList();

    public async Task<KeyDto> Handle(GetKeyByIdQuery request, CancellationToken cancellationToken) =>
        (await _keys.GetByIdAsync(request.Id, cancellationToken) ?? throw new NotFoundException("Ключ не был найден.")).ToDto();

    public async Task<int> Handle(CreateKeyCommand request, CancellationToken cancellationToken)
    {
        var key = new Key { Name = request.Name, Value = request.Value };
        await _keys.AddAsync(key, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return key.Id;
    }

    public async Task<Unit> Handle(UpdateKeyCommand request, CancellationToken cancellationToken)
    {
        var key = await _keys.GetByIdAsync(request.Id, cancellationToken) ?? throw new NotFoundException("Ключ не был найден.");
        key.Name = request.Name;
        key.Value = request.Value;
        _keys.Update(key);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }

    public async Task<Unit> Handle(DeleteKeyCommand request, CancellationToken cancellationToken)
    {
        var key = await _keys.GetByIdAsync(request.Id, cancellationToken) ?? throw new NotFoundException("Ключ не был найден.");
        _keys.Delete(key);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
