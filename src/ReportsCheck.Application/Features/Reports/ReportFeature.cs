using FluentValidation;
using MediatR;
using ReportsCheck.Application.Checks;
using ReportsCheck.Application.Contracts;
using ReportsCheck.Application.Files;
using ReportsCheck.Application.Reports;
using ReportsCheck.Application.Reports.Models;

namespace ReportsCheck.Application.Features.Reports;

// ----- Requests -----
public record ParseStudentsFromArchiveQuery(byte[] ZipContent) : IRequest<IReadOnlyList<ParsedStudent>>;

public record EnqueueCheckReportsCommand(
    IReadOnlyList<int> ModelsId,
    IReadOnlyList<ParsedStudent> StudentsId,
    int LabId,
    int GroupId,
    bool CheckPrev,
    string? ReportsZipName,
    byte[]? ReportsZipContent,
    string? ReportFileName,
    byte[]? ReportFileContent) : IRequest<Unit>;

public record GetLabChecksQuery(int LabId) : IRequest<IReadOnlyList<LabCheckGroupDto>>;

public record GetChecksByIdsQuery(IReadOnlyList<int> Ids) : IRequest<IReadOnlyList<CheckDto>>;

// ----- Validators -----
public class EnqueueCheckReportsValidator : AbstractValidator<EnqueueCheckReportsCommand>
{
    public EnqueueCheckReportsValidator()
    {
        RuleFor(x => x.ModelsId).NotEmpty();
        RuleForEach(x => x.ModelsId).GreaterThan(0);
        RuleFor(x => x.LabId).GreaterThan(0);
        RuleFor(x => x.GroupId).GreaterThan(0);
        RuleFor(x => x)
            .Must(x => x.ReportsZipContent is not null || x.ReportFileContent is not null)
            .WithMessage("Не переданы файлы отчета для проверки");
    }
}

// ----- Handlers -----
public class ReportHandlers :
    IRequestHandler<ParseStudentsFromArchiveQuery, IReadOnlyList<ParsedStudent>>,
    IRequestHandler<EnqueueCheckReportsCommand, Unit>,
    IRequestHandler<GetLabChecksQuery, IReadOnlyList<LabCheckGroupDto>>,
    IRequestHandler<GetChecksByIdsQuery, IReadOnlyList<CheckDto>>
{
    private readonly IFileParsingService _fileParsing;
    private readonly IReportCheckQueue _queue;
    private readonly ICheckService _checkService;

    public ReportHandlers(IFileParsingService fileParsing, IReportCheckQueue queue, ICheckService checkService)
    {
        _fileParsing = fileParsing;
        _queue = queue;
        _checkService = checkService;
    }

    public Task<IReadOnlyList<ParsedStudent>> Handle(ParseStudentsFromArchiveQuery request, CancellationToken cancellationToken) =>
        _fileParsing.ParseStudentsFromArchiveAsync(request.ZipContent, cancellationToken);

    public async Task<Unit> Handle(EnqueueCheckReportsCommand request, CancellationToken cancellationToken)
    {
        var job = new ReportCheckJob
        {
            ModelsId = request.ModelsId,
            StudentsId = request.StudentsId,
            LabId = request.LabId,
            GroupId = request.GroupId,
            CheckPrev = request.CheckPrev,
            ReportsZip = request.ReportsZipContent is not null
                ? new UploadedFile(request.ReportsZipName ?? "reports.zip", request.ReportsZipContent)
                : null,
            ReportFile = request.ReportFileContent is not null
                ? new UploadedFile(request.ReportFileName ?? "report", request.ReportFileContent)
                : null,
        };

        await _queue.EnqueueAsync(job, cancellationToken);
        return Unit.Value;
    }

    public async Task<IReadOnlyList<LabCheckGroupDto>> Handle(GetLabChecksQuery request, CancellationToken cancellationToken)
    {
        var groups = await _checkService.GetLabChecksAsync(request.LabId, cancellationToken);
        return groups.Select(g => g.ToDto()).ToList();
    }

    public async Task<IReadOnlyList<CheckDto>> Handle(GetChecksByIdsQuery request, CancellationToken cancellationToken)
    {
        var checks = await _checkService.GetByIdsAsync(request.Ids, cancellationToken);
        return checks.Select(c => c.ToDto()).ToList();
    }
}
