using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Infrastructure.Persistence.Configurations;

public class ModelConfiguration : IEntityTypeConfiguration<Model>
{
    public void Configure(EntityTypeBuilder<Model> builder)
    {
        builder.Property(m => m.Name).IsRequired();
        builder.Property(m => m.Value).IsRequired();
        builder.Property(m => m.TopP).HasDefaultValue(1.0);
        builder.Property(m => m.Temperature).HasDefaultValue(1.0);
        builder.Property(m => m.MaxRetries).HasDefaultValue(5);
        builder.Property(m => m.QueryDelay).HasDefaultValue(2500);
        builder.Property(m => m.ErrorDelay).HasDefaultValue(10000);
        builder.Property(m => m.MaxTokens).HasDefaultValue(10000);
        builder.Property(m => m.CacheControl).HasDefaultValue(false);
        builder.Property(m => m.LlmInterface).HasConversion<string>();

        // Model * — 1 Key (optional); deleting a key removes its models.
        builder.HasOne(m => m.Key)
            .WithMany(k => k.Models)
            .HasForeignKey(m => m.KeyId)
            .OnDelete(DeleteBehavior.Cascade);

        // Model * — 1 Provider (optional); deleting a provider removes its models.
        builder.HasOne(m => m.Provider)
            .WithMany(p => p.Models)
            .HasForeignKey(m => m.ProviderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
