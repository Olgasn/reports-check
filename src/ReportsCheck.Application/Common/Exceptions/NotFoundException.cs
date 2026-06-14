namespace ReportsCheck.Application.Common.Exceptions;

/// <summary>
/// Аналог NotFoundException из NestJS — сущность не найдена.
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }
}
