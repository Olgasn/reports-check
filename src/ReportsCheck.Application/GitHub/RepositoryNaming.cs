using System.Text;

namespace ReportsCheck.Application.GitHub;

/// <summary>
/// Формирование имени GitHub-репозитория на латинице по шаблону
/// «{группа}_{аббревиатура}_{логин из e-mail}». Транслитерирует кириллицу и
/// очищает результат до символов, допустимых в имени репозитория GitHub.
/// </summary>
public static class RepositoryNaming
{
    // Транслитерация русской кириллицы в латиницу (нижний регистр; верхний обрабатывается отдельно).
    private static readonly Dictionary<char, string> Translit = new()
    {
        ['а'] = "a", ['б'] = "b", ['в'] = "v", ['г'] = "g", ['д'] = "d", ['е'] = "e", ['ё'] = "e",
        ['ж'] = "zh", ['з'] = "z", ['и'] = "i", ['й'] = "y", ['к'] = "k", ['л'] = "l", ['м'] = "m",
        ['н'] = "n", ['о'] = "o", ['п'] = "p", ['р'] = "r", ['с'] = "s", ['т'] = "t", ['у'] = "u",
        ['ф'] = "f", ['х'] = "kh", ['ц'] = "ts", ['ч'] = "ch", ['ш'] = "sh", ['щ'] = "shch",
        ['ъ'] = "", ['ы'] = "y", ['ь'] = "", ['э'] = "e", ['ю'] = "yu", ['я'] = "ya",
    };

    /// <summary>
    /// Собирает имя репозитория: «{группа}_{аббревиатура}_{идентификатор}»,
    /// где идентификатор — обычно локальная часть e-mail студента (см. <see cref="EmailLocalPart"/>).
    /// Каждая часть транслитерируется и очищается; результат не содержит недопустимых символов.
    /// </summary>
    public static string Build(string groupName, string abbreviation, string? identifier)
    {
        var group = Sanitize(Transliterate(groupName));
        var abbr = Sanitize(Transliterate(abbreviation));
        var id = Sanitize(Transliterate(identifier ?? string.Empty));

        var parts = new[] { group, abbr, id }.Where(p => p.Length > 0);
        return string.Join("_", parts);
    }

    /// <summary>
    /// Возвращает локальную часть адреса электронной почты — фрагмент до символа «@».
    /// Для пустого значения возвращает пустую строку; при отсутствии «@» возвращает строку целиком.
    /// </summary>
    public static string EmailLocalPart(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return string.Empty;
        }

        var at = email.IndexOf('@');
        return (at < 0 ? email : email[..at]).Trim();
    }

    /// <summary>Транслитерация кириллицы в латиницу с сохранением регистра.</summary>
    public static string Transliterate(string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        var sb = new StringBuilder(value.Length);
        foreach (var ch in value)
        {
            var lower = char.ToLowerInvariant(ch);
            if (Translit.TryGetValue(lower, out var mapped))
            {
                if (mapped.Length > 0 && char.IsUpper(ch))
                {
                    // Заглавная: первая буква транслитерации заглавная.
                    sb.Append(char.ToUpperInvariant(mapped[0]));
                    if (mapped.Length > 1)
                    {
                        sb.Append(mapped[1..]);
                    }
                }
                else
                {
                    sb.Append(mapped);
                }
            }
            else
            {
                sb.Append(ch);
            }
        }

        return sb.ToString();
    }

    /// <summary>
    /// Оставляет только допустимые в имени GitHub-репозитория символы (A–Z, a–z, 0–9, «.», «_», «-»),
    /// остальные схлопывает в дефис, удаляя дефисы по краям.
    /// </summary>
    public static string Sanitize(string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        var sb = new StringBuilder(value.Length);
        var lastWasDash = false;
        foreach (var ch in value)
        {
            if (char.IsAsciiLetterOrDigit(ch) || ch == '.' || ch == '_' || ch == '-')
            {
                sb.Append(ch);
                lastWasDash = ch == '-';
            }
            else if (!lastWasDash)
            {
                sb.Append('-');
                lastWasDash = true;
            }
        }

        return sb.ToString().Trim('-');
    }
}
