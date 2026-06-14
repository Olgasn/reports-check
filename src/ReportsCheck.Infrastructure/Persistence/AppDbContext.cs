using Microsoft.EntityFrameworkCore;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Lab> Labs => Set<Lab>();
    public DbSet<Prompt> Prompts => Set<Prompt>();
    public DbSet<Check> Checks => Set<Check>();
    public DbSet<Key> Keys => Set<Key>();
    public DbSet<Provider> Providers => Set<Provider>();
    public DbSet<Model> Models => Set<Model>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
