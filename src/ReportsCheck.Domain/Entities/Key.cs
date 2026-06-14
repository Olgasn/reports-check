namespace ReportsCheck.Domain.Entities;

public class Key : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;

    public ICollection<Model> Models { get; set; } = new List<Model>();
}
