using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ReportsCheck.Infrastructure.Persistence;

/// <summary>
/// Фабрика для создания AppDbContext во время разработки (dotnet ef migrations).
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite("Data Source=reports-check.sqlite")
            .Options;

        return new AppDbContext(options);
    }
}
