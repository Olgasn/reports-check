using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Infrastructure.Persistence.Configurations;

public class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.Property(c => c.Name).IsRequired();
        builder.Property(c => c.Description).HasMaxLength(255);

        // Course 1 — 1 Prompt (Prompt holds the FK); deleting a course removes its prompt.
        builder.HasOne(c => c.Prompt)
            .WithOne(p => p.Course)
            .HasForeignKey<Prompt>(p => p.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Course 1 — * Lab; deleting a course removes its labs.
        builder.HasMany(c => c.Labs)
            .WithOne(l => l.Course)
            .HasForeignKey(l => l.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Course * — * Group (implicit join table).
        builder.HasMany(c => c.Groups)
            .WithMany(g => g.Courses);
    }
}
