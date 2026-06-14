using ReportsCheck.Application.Reports.Models;

namespace ReportsCheck.Application.Reports;

/// <summary>
/// Извлекает и валидирует JSON-блок &lt;JSON&gt;...&lt;/JSON&gt; из ответа модели.
/// Порт LlmService.extractData.
/// </summary>
public interface IModelResultExtractor
{
    ModelCheckResult Extract(string content);
}
