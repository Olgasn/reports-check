using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Security;

namespace ReportsCheck.Infrastructure.Persistence.Configurations;

public class CheckConfiguration : IEntityTypeConfiguration<Check>
{
    public void Configure(EntityTypeBuilder<Check> builder)
    {
        builder.Property(c => c.Report).HasDefaultValue(string.Empty);
        builder.Property(c => c.PromptInjectionDetected).HasDefaultValue(false);
        builder.Property(c => c.PromptInjectionRisk).HasDefaultValue(PromptInjectionRisk.None);
        builder.Property(c => c.PromptInjectionFragments).HasDefaultValue(string.Empty);
        builder.Property(c => c.SecurityComment).HasDefaultValue(string.Empty);

        // Check * — 1 Model; deleting a model removes its checks.
        builder.HasOne(c => c.Model)
            .WithMany(m => m.Checks)
            .HasForeignKey(c => c.ModelId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
