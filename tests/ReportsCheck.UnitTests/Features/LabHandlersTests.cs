using FluentAssertions;
using NSubstitute;
using ReportsCheck.Application.Common.Exceptions;
using ReportsCheck.Application.Features.Labs;
using ReportsCheck.Application.Files;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Interfaces;

namespace ReportsCheck.UnitTests.Features;

public class LabHandlersTests
{
    private readonly IRepository<Lab> _labs = Substitute.For<IRepository<Lab>>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();
    private readonly IDocumentTextExtractor _extractor = Substitute.For<IDocumentTextExtractor>();

    private LabHandlers CreateSut() => new(_labs, _unitOfWork, _extractor);

    [Fact]
    public async Task CreateLab_ExtractsTextAndAddsLabAndSaves()
    {
        _extractor.ExtractTextAsync("задание.txt", Arg.Any<byte[]>(), Arg.Any<CancellationToken>())
            .Returns("содержимое задания");
        var sut = CreateSut();

        await sut.Handle(new CreateLabCommand("Лаб 1", "Описание", 2, "задание.txt", [1, 2, 3]), CancellationToken.None);

        await _extractor.Received(1).ExtractTextAsync("задание.txt", Arg.Any<byte[]>(), Arg.Any<CancellationToken>());
        await _labs.Received(1).AddAsync(
            Arg.Is<Lab>(l => l.Name == "Лаб 1" && l.Content == "содержимое задания" && l.CourseId == 2),
            Arg.Any<CancellationToken>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateLab_WhenFileProvided_UpdatesContentAndSaves()
    {
        var lab = new Lab { Id = 1, Name = "Старое", Content = "old" };
        _labs.GetByIdAsync(1, Arg.Any<CancellationToken>()).Returns(lab);
        _extractor.ExtractTextAsync("новый.pdf", Arg.Any<byte[]>(), Arg.Any<CancellationToken>()).Returns("новый текст");
        var sut = CreateSut();

        await sut.Handle(new UpdateLabCommand(1, "Новое", null, "новый.pdf", [9, 8]), CancellationToken.None);

        lab.Name.Should().Be("Новое");
        lab.Content.Should().Be("новый текст");
        _labs.Received(1).Update(lab);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateLab_WhenNoFile_DoesNotExtractText()
    {
        var lab = new Lab { Id = 2, Name = "Имя", Content = "existing" };
        _labs.GetByIdAsync(2, Arg.Any<CancellationToken>()).Returns(lab);
        var sut = CreateSut();

        await sut.Handle(new UpdateLabCommand(2, "Новое имя", null, null, null), CancellationToken.None);

        lab.Name.Should().Be("Новое имя");
        lab.Content.Should().Be("existing");
        await _extractor.DidNotReceive().ExtractTextAsync(Arg.Any<string>(), Arg.Any<byte[]>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteLab_RemovesLabAndSaves()
    {
        var lab = new Lab { Id = 4 };
        _labs.GetByIdAsync(4, Arg.Any<CancellationToken>()).Returns(lab);
        var sut = CreateSut();

        await sut.Handle(new DeleteLabCommand(4), CancellationToken.None);

        _labs.Received(1).Delete(lab);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteLab_WhenNotFound_ThrowsNotFoundException()
    {
        _labs.GetByIdAsync(99, Arg.Any<CancellationToken>()).Returns((Lab?)null);
        var sut = CreateSut();

        await sut.Invoking(h => h.Handle(new DeleteLabCommand(99), CancellationToken.None))
            .Should().ThrowAsync<NotFoundException>();
    }
}
