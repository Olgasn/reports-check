using FluentValidation;
using MediatR;
using ReportsCheck.Application.Common.Exceptions;
using ReportsCheck.Application.Contracts;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Enums;
using ReportsCheck.Domain.Interfaces;

namespace ReportsCheck.Application.Features.Models;

public record GetModelsQuery : IRequest<IReadOnlyList<ModelDto>>;

public record GetModelByIdQuery(int Id) : IRequest<ModelDto>;

public record CreateModelCommand(
    string Name,
    string Value,
    double TopP,
    double Temperature,
    int MaxTokens,
    int MaxRetries,
    int QueryDelay,
    int ErrorDelay,
    string LlmInterface,
    bool CacheControl,
    int? KeyId,
    int? ProviderId) : IRequest<int>;

public record UpdateModelCommand(
    int Id,
    string Name,
    string Value,
    double TopP,
    double Temperature,
    int MaxTokens,
    int MaxRetries,
    int QueryDelay,
    int ErrorDelay,
    string LlmInterface,
    bool CacheControl,
    int? KeyId,
    int? ProviderId) : IRequest<Unit>;

public record DeleteModelCommand(int Id) : IRequest<Unit>;

public class CreateModelValidator : AbstractValidator<CreateModelCommand>
{
    public CreateModelValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MinimumLength(1);
        RuleFor(x => x.Value).NotEmpty().MinimumLength(1);
        RuleFor(x => x.TopP).InclusiveBetween(0, 1);
        RuleFor(x => x.Temperature).InclusiveBetween(0, 2);
        RuleFor(x => x.MaxTokens).GreaterThan(0);
        RuleFor(x => x.LlmInterface).Must(v => Enum.TryParse<LlmInterface>(v, out _))
            .WithMessage("llmInterface должен быть OpenAi или Ollama.");
    }
}

public class ModelHandlers :
    IRequestHandler<GetModelsQuery, IReadOnlyList<ModelDto>>,
    IRequestHandler<GetModelByIdQuery, ModelDto>,
    IRequestHandler<CreateModelCommand, int>,
    IRequestHandler<UpdateModelCommand, Unit>,
    IRequestHandler<DeleteModelCommand, Unit>
{
    private readonly IRepository<Model> _models;
    private readonly IUnitOfWork _unitOfWork;

    public ModelHandlers(IRepository<Model> models, IUnitOfWork unitOfWork)
    {
        _models = models;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<ModelDto>> Handle(GetModelsQuery request, CancellationToken cancellationToken) =>
        (await _models.GetAllAsync(cancellationToken, m => m.Key!, m => m.Provider!)).Select(m => m.ToDto()).ToList();

    public async Task<ModelDto> Handle(GetModelByIdQuery request, CancellationToken cancellationToken) =>
        (await _models.GetByIdAsync(request.Id, cancellationToken, m => m.Key!, m => m.Provider!)
            ?? throw new NotFoundException("Модель не была найдена.")).ToDto();

    public async Task<int> Handle(CreateModelCommand request, CancellationToken cancellationToken)
    {
        var model = new Model();
        Apply(model, request.Name, request.Value, request.TopP, request.Temperature, request.MaxTokens,
            request.MaxRetries, request.QueryDelay, request.ErrorDelay, request.LlmInterface, request.CacheControl,
            request.KeyId, request.ProviderId);
        await _models.AddAsync(model, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return model.Id;
    }

    public async Task<Unit> Handle(UpdateModelCommand request, CancellationToken cancellationToken)
    {
        var model = await _models.GetByIdAsync(request.Id, cancellationToken) ?? throw new NotFoundException("Модель не была найдена.");
        Apply(model, request.Name, request.Value, request.TopP, request.Temperature, request.MaxTokens,
            request.MaxRetries, request.QueryDelay, request.ErrorDelay, request.LlmInterface, request.CacheControl,
            request.KeyId, request.ProviderId);
        _models.Update(model);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }

    public async Task<Unit> Handle(DeleteModelCommand request, CancellationToken cancellationToken)
    {
        var model = await _models.GetByIdAsync(request.Id, cancellationToken) ?? throw new NotFoundException("Модель не была найдена.");
        _models.Delete(model);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }

    private static void Apply(Model model, string name, string value, double topP, double temperature, int maxTokens,
        int maxRetries, int queryDelay, int errorDelay, string llmInterface, bool cacheControl, int? keyId, int? providerId)
    {
        model.Name = name;
        model.Value = value;
        model.TopP = topP;
        model.Temperature = temperature;
        model.MaxTokens = maxTokens;
        model.MaxRetries = maxRetries;
        model.QueryDelay = queryDelay;
        model.ErrorDelay = errorDelay;
        model.LlmInterface = Enum.Parse<LlmInterface>(llmInterface);
        model.CacheControl = cacheControl;
        model.KeyId = keyId;
        model.ProviderId = providerId;
    }
}
