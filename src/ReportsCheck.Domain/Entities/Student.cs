namespace ReportsCheck.Domain.Entities;

public class Student : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Middlename { get; set; } = string.Empty;

    public int? GroupId { get; set; }
    public Group? Group { get; set; }

    public ICollection<Check> Checks { get; set; } = new List<Check>();
}
