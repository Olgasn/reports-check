using System.Linq.Expressions;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Domain.Interfaces;

public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes);

    Task<List<T>> GetAllAsync(CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes);

    Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes);

    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes);

    Task<(List<T> Items, int Total)> PageAsync(Expression<Func<T, bool>> predicate, int skip, int take, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes);

    Task AddAsync(T entity, CancellationToken cancellationToken = default);

    void Update(T entity);

    void Delete(T entity);

    IQueryable<T> Query();
}
