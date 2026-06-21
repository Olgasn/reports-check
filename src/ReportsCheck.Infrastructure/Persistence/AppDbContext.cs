using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Infrastructure.Security;

namespace ReportsCheck.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    private readonly ISecretProtector _secretProtector;

    public AppDbContext(DbContextOptions<AppDbContext> options, ISecretProtector? secretProtector = null) : base(options)
    {
        // Заглушка по умолчанию — для dotnet ef и тестов, где Data Protection не сконфигурирован.
        _secretProtector = secretProtector ?? IdentitySecretProtector.Instance;
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
    public DbSet<StudentRepository> StudentRepositories => Set<StudentRepository>();
    public DbSet<AppSettings> AppSettings => Set<AppSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Прозрачное шифрование секретов в БД. Захватываем локальную переменную (не this),
        // чтобы выражения конвертера ссылались на singleton-протектор, а не на конкретный контекст.
        var protector = _secretProtector;
        var secret = new ValueConverter<string, string>(
            v => protector.Protect(v),
            v => protector.Unprotect(v));

        modelBuilder.Entity<Key>().Property(k => k.Value).HasConversion(secret);
        modelBuilder.Entity<AppSettings>().Property(s => s.SmtpPassword).HasConversion(secret);
        modelBuilder.Entity<AppSettings>().Property(s => s.GitHubToken).HasConversion(secret);
    }
}
