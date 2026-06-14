using ReportsCheck.Application.Llm;

namespace ReportsCheck.Infrastructure.Llm;

/// <summary>
/// Запись сырого ответа модели в models_logs/&lt;timestamp&gt;_model_&lt;name&gt;.txt.
/// Порт FileService.writeFile (применение для логов моделей).
/// </summary>
public class ModelResponseLogger : IModelResponseLogger
{
    public void Write(string modelName, string content)
    {
        var dir = Path.Combine(Directory.GetCurrentDirectory(), "models_logs");
        Directory.CreateDirectory(dir);

        var fileName = $"{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_model_{modelName}.txt";
        File.WriteAllText(Path.Combine(dir, fileName), content);
    }
}
