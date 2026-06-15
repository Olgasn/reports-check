using ReportsCheck.Application.Security;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Security;

namespace ReportsCheck.Application.Reports.Models;

/// <summary>
/// Результат проверки одного отчёта одной моделью внутри конвейера.
/// Порт CheckResult из src/types/reports.types.
/// </summary>
public class CheckResult : IPromptInjectionFields
{
    public required Student Student { get; set; }
    public int Grade { get; set; }
    public string Review { get; set; } = string.Empty;
    public List<string> Advantages { get; set; } = [];
    public List<string> Disadvantages { get; set; } = [];
    public bool PromptInjectionDetected { get; set; }
    public string PromptInjectionRisk { get; set; } = Domain.Security.PromptInjectionRisk.None;
    public List<string> PromptInjectionFragments { get; set; } = [];
    public string SecurityComment { get; set; } = string.Empty;
    public required Model Model { get; set; }
    public string Answer { get; set; } = string.Empty;

    /// <summary>Потрачено входных токенов (в мультимодельном режиме — сумма по всем моделям).</summary>
    public int InputTokens { get; set; }

    /// <summary>Потрачено выходных токенов (в мультимодельном режиме — сумма по всем моделям).</summary>
    public int OutputTokens { get; set; }

    /// <summary>Стоимость в USD, зафиксированная по ценам модели на момент проверки.</summary>
    public decimal Cost { get; set; }
}
