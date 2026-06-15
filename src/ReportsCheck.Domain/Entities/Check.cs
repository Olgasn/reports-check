using ReportsCheck.Domain.Security;

namespace ReportsCheck.Domain.Entities;

public class Check : BaseEntity
{
    public string Advantages { get; set; } = string.Empty;
    public string Disadvantages { get; set; } = string.Empty;
    public int Grade { get; set; }
    public string Review { get; set; } = string.Empty;
    public string Report { get; set; } = string.Empty;

    public bool PromptInjectionDetected { get; set; }
    public string PromptInjectionRisk { get; set; } = Security.PromptInjectionRisk.None;
    public string PromptInjectionFragments { get; set; } = string.Empty;
    public string SecurityComment { get; set; } = string.Empty;

    /// <summary>Потрачено входных токенов на проверку (для мультимодельного режима — сумма по всем моделям).</summary>
    public int InputTokens { get; set; }

    /// <summary>Потрачено выходных токенов на проверку (для мультимодельного режима — сумма по всем моделям).</summary>
    public int OutputTokens { get; set; }

    /// <summary>Стоимость проверки в USD, зафиксированная по ценам модели на момент проверки.</summary>
    public decimal Cost { get; set; }

    public DateTime Date { get; set; } = DateTime.UtcNow;

    public int LabId { get; set; }
    public Lab Lab { get; set; } = null!;

    public int ModelId { get; set; }
    public Model Model { get; set; } = null!;

    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
}
