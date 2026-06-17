using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Infrastructure.Persistence.Configurations;

public class AppSettingsConfiguration : IEntityTypeConfiguration<AppSettings>
{
    public void Configure(EntityTypeBuilder<AppSettings> builder)
    {
        builder.Property(s => s.GitHubOrg).HasDefaultValue("IT-GSTU");
        builder.Property(s => s.GitHubOwner).HasDefaultValue("olgasn");
        builder.Property(s => s.RepoPrivate).HasDefaultValue(true);
        builder.Property(s => s.SmtpPort).HasDefaultValue(587);
    }
}
