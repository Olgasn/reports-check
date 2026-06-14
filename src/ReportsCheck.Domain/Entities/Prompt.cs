namespace ReportsCheck.Domain.Entities;

public class Prompt : BaseEntity
{
    public string Content { get; set; } = string.Empty;

    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;
}
