namespace ReportsCheck.Domain.Entities;

public class Course : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public Prompt? Prompt { get; set; }
    public ICollection<Group> Groups { get; set; } = new List<Group>();
    public ICollection<Lab> Labs { get; set; } = new List<Lab>();
}
