namespace ReportsCheck.Application.Contracts;

public record PromptDto(int Id, string Content);

public record CourseDto(int Id, string Name, string Description, PromptDto? Prompt);

public record CourseSimpleDto(int Id, string Name);

public record CourseWithLabsDto(int Id, string Name, IReadOnlyList<LabSimpleDto> Labs);

public record GroupDto(int Id, string Name);

public record StudentDto(int Id, string Name, string Surname, string Middlename, GroupDto? Group);

public record LabSimpleDto(int Id, string Name);

public record LabDto(int Id, string Name, string Description, string Filename, int Filesize, string Content, CourseDto? Course);

public record KeyDto(int Id, string Name, string Value);

public record ProviderDto(int Id, string Name, string Url);

public record ModelDto(
    int Id,
    string Name,
    string Value,
    double TopP,
    double Temperature,
    int MaxTokens,
    int MaxRetries,
    int QueryDelay,
    int ErrorDelay,
    string LlmInterface,
    bool CacheControl,
    KeyDto? Key,
    ProviderDto? Provider);

public record CheckDto(
    int Id,
    int Grade,
    string Advantages,
    string Disadvantages,
    string Review,
    string Report,
    bool PromptInjectionDetected,
    string PromptInjectionRisk,
    string PromptInjectionFragments,
    string SecurityComment,
    DateTime Date,
    ModelDto? Model,
    StudentDto? Student);

public record StudentChecksDto(StudentDto Student, IReadOnlyList<CheckDto> Checks);

public record LabCheckGroupDto(GroupDto Group, IReadOnlyList<StudentChecksDto> Results);
