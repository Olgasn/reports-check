namespace ReportsCheck.Domain.Entities;

public class Lab : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Filename { get; set; } = string.Empty;
    public int Filesize { get; set; }
    public string Content { get; set; } = string.Empty;

    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public ICollection<Check> Checks { get; set; } = new List<Check>();
}
