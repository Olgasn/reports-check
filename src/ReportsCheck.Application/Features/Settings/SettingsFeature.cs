using FluentValidation;
using MediatR;
using ReportsCheck.Application.Contracts;
using ReportsCheck.Application.Settings;

namespace ReportsCheck.Application.Features.Settings;

// ----- Requests -----
public record GetSettingsQuery : IRequest<AppSettingsDto>;

public record UpdateGitHubSettingsCommand(string GitHubToken, string GitHubOrg, string GitHubOwner, bool RepoPrivate) : IRequest<Unit>;

public record UpdateEmailSettingsCommand(string SmtpServer, int SmtpPort, string SenderName, string SenderEmail, string SmtpPassword) : IRequest<Unit>;

// ----- Validators -----
public class UpdateGitHubSettingsValidator : AbstractValidator<UpdateGitHubSettingsCommand>
{
    public UpdateGitHubSettingsValidator()
    {
        RuleFor(x => x.GitHubOrg).NotEmpty();
        RuleFor(x => x.GitHubOwner).NotEmpty();
    }
}

public class UpdateEmailSettingsValidator : AbstractValidator<UpdateEmailSettingsCommand>
{
    public UpdateEmailSettingsValidator()
    {
        RuleFor(x => x.SmtpPort).InclusiveBetween(1, 65535);
    }
}

// ----- Handlers -----
public class SettingsHandlers :
    IRequestHandler<GetSettingsQuery, AppSettingsDto>,
    IRequestHandler<UpdateGitHubSettingsCommand, Unit>,
    IRequestHandler<UpdateEmailSettingsCommand, Unit>
{
    private readonly ISettingsService _settings;

    public SettingsHandlers(ISettingsService settings)
    {
        _settings = settings;
    }

    public async Task<AppSettingsDto> Handle(GetSettingsQuery request, CancellationToken cancellationToken)
    {
        var settings = await _settings.GetAsync(cancellationToken);
        return settings.ToDto();
    }

    public async Task<Unit> Handle(UpdateGitHubSettingsCommand request, CancellationToken cancellationToken)
    {
        var settings = await _settings.GetAsync(cancellationToken);
        settings.GitHubToken = request.GitHubToken;
        settings.GitHubOrg = request.GitHubOrg;
        settings.GitHubOwner = request.GitHubOwner;
        settings.RepoPrivate = request.RepoPrivate;
        await _settings.SaveAsync(settings, cancellationToken);
        return Unit.Value;
    }

    public async Task<Unit> Handle(UpdateEmailSettingsCommand request, CancellationToken cancellationToken)
    {
        var settings = await _settings.GetAsync(cancellationToken);
        settings.SmtpServer = request.SmtpServer;
        settings.SmtpPort = request.SmtpPort;
        settings.SenderName = request.SenderName;
        settings.SenderEmail = request.SenderEmail;
        settings.SmtpPassword = request.SmtpPassword;
        await _settings.SaveAsync(settings, cancellationToken);
        return Unit.Value;
    }
}
