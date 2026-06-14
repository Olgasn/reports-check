using ReportsCheck.Application.Prompts;

namespace ReportsCheck.Web;

/// <summary>
/// Загрузка трёх шаблонов промптов из каталога Prompts при старте.
/// Порт чтения шаблонов в config.ts.
/// </summary>
public static class PromptTemplatesLoader
{
    public static PromptTemplates Load(string contentRootPath)
    {
        var dir = Path.Combine(contentRootPath, "Prompts");

        return new PromptTemplates
        {
            Standard = File.ReadAllText(Path.Combine(dir, "prompt.template")),
            Multiple = File.ReadAllText(Path.Combine(dir, "prompt-multiple.template")),
            Prev = File.ReadAllText(Path.Combine(dir, "prompt-prev.template")),
        };
    }
}
