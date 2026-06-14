using ReportsCheck.Domain.Enums;

namespace ReportsCheck.Domain.Entities;

public class Model : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;

    public double TopP { get; set; } = 1.0;
    public double Temperature { get; set; } = 1.0;
    public int MaxRetries { get; set; } = 5;
    public int QueryDelay { get; set; } = 2500;
    public int ErrorDelay { get; set; } = 10000;
    public int MaxTokens { get; set; } = 10000;

    public LlmInterface LlmInterface { get; set; }
    public bool CacheControl { get; set; }

    public int? KeyId { get; set; }
    public Key? Key { get; set; }

    public int? ProviderId { get; set; }
    public Provider? Provider { get; set; }

    public ICollection<Check> Checks { get; set; } = new List<Check>();
}
