using FluentAssertions;
using NSubstitute;
using ReportsCheck.Application.Common.Exceptions;
using ReportsCheck.Application.Features.Models;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Enums;
using ReportsCheck.Domain.Interfaces;

namespace ReportsCheck.UnitTests.Features;

public class ModelHandlersTests
{
    private readonly IRepository<Model> _models = Substitute.For<IRepository<Model>>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();

    private ModelHandlers CreateSut() => new(_models, _unitOfWork);

    private static CreateModelCommand ValidCreateCommand(string llmInterface = "OpenAi") => new(
        Name: "GPT-4o",
        Value: "gpt-4o",
        TopP: 1.0,
        Temperature: 0.7,
        MaxTokens: 4096,
        MaxRetries: 3,
        QueryDelay: 0,
        ErrorDelay: 500,
        LlmInterface: llmInterface,
        CacheControl: false,
        KeyId: null,
        ProviderId: null);

    [Fact]
    public async Task CreateModel_AddsModelWithParsedEnumAndSaves()
    {
        var sut = CreateSut();

        await sut.Handle(ValidCreateCommand("Ollama"), CancellationToken.None);

        await _models.Received(1).AddAsync(
            Arg.Is<Model>(m => m.Name == "GPT-4o" && m.LlmInterface == LlmInterface.Ollama),
            Arg.Any<CancellationToken>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateModel_WhenNotFound_ThrowsNotFoundException()
    {
        _models.GetByIdAsync(99, Arg.Any<CancellationToken>()).Returns((Model?)null);
        var sut = CreateSut();

        var cmd = new UpdateModelCommand(99, "n", "v", 1, 1, 100, 1, 0, 0, "OpenAi", false, null, null);
        await sut.Invoking(h => h.Handle(cmd, CancellationToken.None))
            .Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task DeleteModel_RemovesModelAndSaves()
    {
        var model = new Model { Id = 7, Name = "Модель" };
        _models.GetByIdAsync(7, Arg.Any<CancellationToken>()).Returns(model);
        var sut = CreateSut();

        await sut.Handle(new DeleteModelCommand(7), CancellationToken.None);

        _models.Received(1).Delete(model);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteModel_WhenNotFound_ThrowsNotFoundException()
    {
        _models.GetByIdAsync(99, Arg.Any<CancellationToken>()).Returns((Model?)null);
        var sut = CreateSut();

        await sut.Invoking(h => h.Handle(new DeleteModelCommand(99), CancellationToken.None))
            .Should().ThrowAsync<NotFoundException>();
    }
}
