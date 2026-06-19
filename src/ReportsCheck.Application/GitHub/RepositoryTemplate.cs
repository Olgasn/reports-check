namespace ReportsCheck.Application.GitHub;

/// <summary>
/// Шаблон структуры учебного репозитория: 6 лабораторных работ.
/// Возвращает словарь «путь → содержимое файла» (порядок не важен).
/// Папки в git существуют только за счёт файлов, поэтому в каждой папке есть Readme.md,
/// а файлы workflow (*.yml) содержат лишь заглушку-комментарий (пустые файлы Contents API не создаёт).
/// </summary>
public static class RepositoryTemplate
{
    public const int LabCount = 6;

    /// <summary>
    /// Строит набор файлов репозитория для студента.
    /// </summary>
    /// <param name="fullName">ФИО студента.</param>
    /// <param name="groupName">Название группы.</param>
    /// <param name="courseName">Название дисциплины.</param>
    public static IReadOnlyDictionary<string, string> BuildFiles(string fullName, string groupName, string courseName)
    {
        var files = new Dictionary<string, string>
        {
            // README.md в верхнем регистре — перезаписывает файл, созданный AutoInit.
            ["README.md"] = BuildRootReadme(fullName, groupName, courseName),
        };

        for (var i = 1; i <= LabCount; i++)
        {
            var n = i.ToString("D2");
            files[$"Lab{n}/Readme.md"] = $"# Лабораторная работа №{i}\n";
            // Заглушка-комментарий: Contents API не создаёт пустые файлы, а пустой workflow
            // всё равно невалиден для GitHub Actions. Содержимое заполняется позже.
            files[$".github/workflows/lab{n}.yml"] = $"# Workflow для лабораторной работы №{i} (заполните позже)\n";
        }

        return files;
    }

    private static string BuildRootReadme(string fullName, string groupName, string courseName) =>
        $"""
        # {courseName}

        - **Студент:** {fullName}
        - **Группа:** {groupName}
        - **Дисциплина:** {courseName}

        ## Лабораторные работы

        - [Лабораторная работа №1](Lab01/Readme.md)
        - [Лабораторная работа №2](Lab02/Readme.md)
        - [Лабораторная работа №3](Lab03/Readme.md)
        - [Лабораторная работа №4](Lab04/Readme.md)
        - [Лабораторная работа №5](Lab05/Readme.md)
        - [Лабораторная работа №6](Lab06/Readme.md)
        """;
}
