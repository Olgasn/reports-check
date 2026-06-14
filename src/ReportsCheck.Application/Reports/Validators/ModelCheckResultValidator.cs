using FluentValidation;
using ReportsCheck.Application.Reports.Models;
using ReportsCheck.Domain.Security;

namespace ReportsCheck.Application.Reports.Validators;

/// <summary>
/// Порт class-validator ограничений CheckResultDto.
/// </summary>
public class ModelCheckResultValidator : AbstractValidator<ModelCheckResult>
{
    private static readonly string[] RiskLevels =
        [PromptInjectionRisk.None, PromptInjectionRisk.Low, PromptInjectionRisk.Medium, PromptInjectionRisk.High];

    public ModelCheckResultValidator()
    {
        RuleFor(x => x.Grade).InclusiveBetween(1, 10);

        RuleFor(x => x.Review).NotNull().MaximumLength(5000);

        RuleFor(x => x.Advantages).NotNull().NotEmpty()
            .Must(a => a.Count <= 30).WithMessage("advantages must contain no more than 30 elements");
        RuleForEach(x => x.Advantages).MaximumLength(1000);

        RuleFor(x => x.Disadvantages).NotNull()
            .Must(d => d.Count <= 50).WithMessage("disadvantages must contain no more than 50 elements");
        RuleForEach(x => x.Disadvantages).MaximumLength(1000);

        RuleFor(x => x.PromptInjectionRisk).Must(r => RiskLevels.Contains(r))
            .WithMessage("promptInjectionRisk must be one of: none, low, medium, high");

        RuleForEach(x => x.PromptInjectionFragments).MaximumLength(500);
        RuleFor(x => x.PromptInjectionFragments).Must(f => f.Count <= 20)
            .WithMessage("promptInjectionFragments must contain no more than 20 elements");

        RuleFor(x => x.SecurityComment).MaximumLength(2000);
    }
}
