namespace ReportsCheck.Infrastructure.Llm;

/// <summary>
/// Настройки LLM. Ollama по умолчанию работает локально (как new Ollama() в исходнике).
/// </summary>
public class LlmOptions
{
    public const string SectionName = "Llm";

    public string OllamaEndpoint { get; set; } = "http://localhost:11434";
}
