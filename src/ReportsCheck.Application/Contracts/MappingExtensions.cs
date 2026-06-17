using ReportsCheck.Application.Checks;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.Application.Contracts;

public static class MappingExtensions
{
    public static PromptDto ToDto(this Prompt p) => new(p.Id, p.Content);

    public static CourseDto ToDto(this Course c) =>
        new(c.Id, c.Name, c.Description, c.Abbreviation, c.Prompt?.ToDto());

    public static CourseSimpleDto ToSimpleDto(this Course c) => new(c.Id, c.Name);

    public static GroupDto ToDto(this Group g) => new(g.Id, g.Name);

    public static StudentDto ToDto(this Student s) =>
        new(s.Id, s.Name, s.Surname, s.Middlename, s.Email, s.Number, s.GitHubUsername, s.Group?.ToDto());

    public static StudentRepositoryDto ToDto(this StudentRepository r) =>
        new(r.Id, r.StudentId,
            string.Join(' ', new[] { r.Student?.Surname, r.Student?.Name, r.Student?.Middlename }
                .Where(p => !string.IsNullOrWhiteSpace(p) && p != "-")),
            r.Student?.Number, r.CourseId, r.Name, r.Url, r.Status, r.Error, r.InvitationEmailed, r.CreatedAt);

    public static AppSettingsDto ToDto(this AppSettings s) =>
        new(s.GitHubToken, s.GitHubOrg, s.GitHubOwner, s.RepoPrivate,
            s.SmtpServer, s.SmtpPort, s.SenderName, s.SenderEmail, s.SmtpPassword);

    public static LabSimpleDto ToSimpleDto(this Lab l) => new(l.Id, l.Name);

    public static LabDto ToDto(this Lab l) =>
        new(l.Id, l.Name, l.Description, l.Filename, l.Filesize, l.Content, l.Course?.ToDto());

    public static KeyDto ToDto(this Key k) => new(k.Id, k.Name, k.Value);

    public static ProviderDto ToDto(this Provider p) => new(p.Id, p.Name, p.Url);

    public static ModelDto ToDto(this Model m) =>
        new(m.Id, m.Name, m.Value, m.TopP, m.Temperature, m.MaxTokens, m.MaxRetries, m.QueryDelay, m.ErrorDelay,
            m.InputTokenPrice, m.OutputTokenPrice, m.LlmInterface.ToString(), m.CacheControl, m.Key?.ToDto(), m.Provider?.ToDto());

    public static CheckDto ToDto(this Check c) =>
        new(c.Id, c.Grade, c.Advantages, c.Disadvantages, c.Review, c.Report,
            c.PromptInjectionDetected, c.PromptInjectionRisk, c.PromptInjectionFragments, c.SecurityComment,
            c.InputTokens, c.OutputTokens, c.Cost, c.Date, c.Model?.ToDto(), c.Student?.ToDto());

    public static LabCheckGroupDto ToDto(this LabCheckGroup g) =>
        new(g.Group.ToDto(), g.Results.Select(r => new StudentChecksDto(
            r.Student.ToDto(), r.Checks.Select(c => c.ToDto()).ToList())).ToList());
}
