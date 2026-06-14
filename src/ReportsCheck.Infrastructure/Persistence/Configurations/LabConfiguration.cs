using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Infrastructure.Persistence.Configurations;

public class LabConfiguration : IEntityTypeConfiguration<Lab>
{
    public void Configure(EntityTypeBuilder<Lab> builder)
    {
        builder.Property(l => l.Name).IsRequired();

        // Lab 1 — * Check; deleting a lab removes its checks.
        builder.HasMany(l => l.Checks)
            .WithOne(c => c.Lab)
            .HasForeignKey(c => c.LabId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
