using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ReportsCheck.Application.Reports.Models;

namespace ReportsCheck.Application.Reports;

/// <summary>
/// Прямой порт LlmService.extractData / normalizeJsonBlock / parseModelJson /
/// escapeControlCharsInStrings / removeTrailingCommas.
/// </summary>
public class ModelResultExtractor : IModelResultExtractor
{
    private readonly IValidator<ModelCheckResult> _validator;
    private readonly ILogger<ModelResultExtractor> _logger;

    private static readonly Regex JsonRegex = new(@"<JSON>([\s\S]*?)<\/JSON>", RegexOptions.IgnoreCase);

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString,
    };

    public ModelResultExtractor(IValidator<ModelCheckResult> validator, ILogger<ModelResultExtractor> logger)
    {
        _validator = validator;
        _logger = logger;
    }

    public ModelCheckResult Extract(string content)
    {
        var match = JsonRegex.Match(content);

        if (!match.Success)
        {
            throw new InvalidOperationException("JSON block not found in the content");
        }

        var jsonString = NormalizeJsonBlock(match.Groups[1].Value.Trim());
        var result = ParseModelJson(jsonString);

        var validation = _validator.Validate(result);

        if (!validation.IsValid)
        {
            var messages = string.Join(", ", validation.Errors.Select(e => e.ErrorMessage));
            throw new InvalidOperationException($"Validation error: {messages}");
        }

        return result;
    }

    public static string NormalizeJsonBlock(string json)
    {
        json = Regex.Replace(json, @"^```json\s*", string.Empty, RegexOptions.IgnoreCase);
        json = Regex.Replace(json, @"^```\s*", string.Empty, RegexOptions.IgnoreCase);
        json = Regex.Replace(json, @"\s*```$", string.Empty, RegexOptions.IgnoreCase);
        return json.Trim();
    }

    private ModelCheckResult ParseModelJson(string json)
    {
        var sanitized = EscapeControlCharsInStrings(json);
        var sanitizedWithoutTrailingCommas = RemoveTrailingCommas(sanitized);
        var attempts = new[] { json, sanitized, sanitizedWithoutTrailingCommas };

        for (var i = 0; i < attempts.Length; i++)
        {
            try
            {
                if (i > 0)
                {
                    _logger.LogWarning("Используется fallback-парсинг JSON ответа модели, попытка {Attempt}", i + 1);
                }

                var parsed = JsonSerializer.Deserialize<ModelCheckResult>(attempts[i], JsonOptions);

                if (parsed is null)
                {
                    throw new JsonException("Deserialized to null");
                }

                return parsed;
            }
            catch (JsonException ex)
            {
                if (i == attempts.Length - 1)
                {
                    throw new InvalidOperationException($"Failed to parse JSON: {ex.Message}");
                }
            }
        }

        throw new InvalidOperationException("Failed to parse JSON: unknown parsing error");
    }

    public static string EscapeControlCharsInStrings(string raw)
    {
        var result = new StringBuilder(raw.Length);
        var inString = false;
        var escaped = false;

        foreach (var ch in raw)
        {
            if (!inString)
            {
                if (ch == '"')
                {
                    inString = true;
                }

                result.Append(ch);
                continue;
            }

            if (escaped)
            {
                result.Append(ch);
                escaped = false;
                continue;
            }

            if (ch == '\\')
            {
                result.Append(ch);
                escaped = true;
                continue;
            }

            if (ch == '"')
            {
                result.Append(ch);
                inString = false;
                continue;
            }

            switch (ch)
            {
                case '\n':
                    result.Append("\\n");
                    break;
                case '\r':
                    result.Append("\\r");
                    break;
                case '\t':
                    result.Append("\\t");
                    break;
                default:
                    if (ch < 0x20)
                    {
                        result.Append(' ');
                    }
                    else
                    {
                        result.Append(ch);
                    }
                    break;
            }
        }

        return result.ToString();
    }

    public static string RemoveTrailingCommas(string json) =>
        Regex.Replace(json, @",\s*([}\]])", "$1");
}
