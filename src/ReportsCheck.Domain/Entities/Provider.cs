namespace ReportsCheck.Domain.Entities;

public class Provider : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;

    public ICollection<Model> Models { get; set; } = new List<Model>();
}
