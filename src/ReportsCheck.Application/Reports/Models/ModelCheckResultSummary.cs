using System.Text.Json.Serialization;
using ReportsCheck.Domain.Security;

namespace ReportsCheck.Application.Reports.Models;

/// <summary>
/// Сводка проверки одной моделью для передачи модели-агрегатору
/// (multiple-model). Порт ModelCheckResultSummary.
/// </summary>
public class ModelCheckResultSummary
{
    [JsonPropertyName("modelName")]
    public string ModelName { get; set; } = string.Empty;

    [JsonPropertyName("review")]
    public string Review { get; set; } = string.Empty;

    [JsonPropertyName("grade")]
    public int Grade { get; set; }

    [JsonPropertyName("advantages")]
    public List<string> Advantages { get; set; } = [];

    [JsonPropertyName("disadvantages")]
    public List<string> Disadvantages { get; set; } = [];

    [JsonPropertyName("promptInjectionDetected")]
    public bool PromptInjectionDetected { get; set; }

    [JsonPropertyName("promptInjectionRisk")]
    public string PromptInjectionRisk { get; set; } = Domain.Security.PromptInjectionRisk.None;

    [JsonPropertyName("promptInjectionFragments")]
    public List<string> PromptInjectionFragments { get; set; } = [];

    [JsonPropertyName("securityComment")]
    public string SecurityComment { get; set; } = string.Empty;
}
