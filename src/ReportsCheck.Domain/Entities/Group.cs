namespace ReportsCheck.Domain.Entities;

public class Group : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<Course> Courses { get; set; } = new List<Course>();
}
