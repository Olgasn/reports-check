using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Interfaces;

namespace ReportsCheck.Infrastructure.Persistence;

public class Repository<T> : IRepository<T> where T : BaseEntity
{
    private readonly AppDbContext _context;
    private readonly DbSet<T> _set;

    public Repository(AppDbContext context)
    {
        _context = context;
        _set = context.Set<T>();
    }

    private IQueryable<T> WithIncludes(params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _set;

        foreach (var include in includes)
        {
            query = query.Include(include);
        }

        return query;
    }

    public Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes) =>
        WithIncludes(includes).FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public Task<List<T>> GetAllAsync(CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes) =>
        WithIncludes(includes).ToListAsync(cancellationToken);

    public Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes) =>
        WithIncludes(includes).Where(predicate).ToListAsync(cancellationToken);

    public Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes) =>
        WithIncludes(includes).FirstOrDefaultAsync(predicate, cancellationToken);

    public async Task<(List<T> Items, int Total)> PageAsync(Expression<Func<T, bool>> predicate, int skip, int take, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes)
    {
        var query = WithIncludes(includes).Where(predicate);
        var total = await query.CountAsync(cancellationToken);
        var items = await query.OrderBy(e => e.Id).Skip(skip).Take(take).ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task AddAsync(T entity, CancellationToken cancellationToken = default) =>
        await _set.AddAsync(entity, cancellationToken);

    public void Update(T entity) => _set.Update(entity);

    public void Delete(T entity) => _set.Remove(entity);

    public IQueryable<T> Query() => _set;
}
