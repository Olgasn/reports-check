using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Infrastructure.Persistence.Configurations;

public class StudentRepositoryConfiguration : IEntityTypeConfiguration<StudentRepository>
{
    public void Configure(EntityTypeBuilder<StudentRepository> builder)
    {
        builder.Property(r => r.Name).IsRequired();
        builder.Property(r => r.Url).IsRequired();
        builder.Property(r => r.Status).IsRequired();

        // Один репозиторий на пару (студент, дисциплина).
        builder.HasIndex(r => new { r.StudentId, r.CourseId }).IsUnique();

        // StudentRepository * — 1 Course; deleting a course removes its repositories.
        builder.HasOne(r => r.Course)
            .WithMany()
            .HasForeignKey(r => r.CourseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
