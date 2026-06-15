using FluentAssertions;
using NSubstitute;
using ReportsCheck.Application.Common.Exceptions;
using ReportsCheck.Application.Features.Providers;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Interfaces;

namespace ReportsCheck.UnitTests.Features;

public class ProviderHandlersTests
{
    private readonly IRepository<Provider> _providers = Substitute.For<IRepository<Provider>>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();

    private ProviderHandlers CreateSut() => new(_providers, _unitOfWork);

    [Fact]
    public async Task CreateProvider_AddsProviderAndSaves()
    {
        var sut = CreateSut();

        await sut.Handle(new CreateProviderCommand("OpenRouter", "https://openrouter.ai"), CancellationToken.None);

        await _providers.Received(1).AddAsync(
            Arg.Is<Provider>(p => p.Name == "OpenRouter" && p.Url == "https://openrouter.ai"),
            Arg.Any<CancellationToken>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateProvider_UpdatesFieldsAndSaves()
    {
        var provider = new Provider { Id = 2, Name = "Старый", Url = "http://old.example" };
        _providers.GetByIdAsync(2, Arg.Any<CancellationToken>()).Returns(provider);
        var sut = CreateSut();

        await sut.Handle(new UpdateProviderCommand(2, "Новый", "https://new.example"), CancellationToken.None);

        provider.Name.Should().Be("Новый");
        provider.Url.Should().Be("https://new.example");
        _providers.Received(1).Update(provider);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateProvider_WhenNotFound_ThrowsNotFoundException()
    {
        _providers.GetByIdAsync(99, Arg.Any<CancellationToken>()).Returns((Provider?)null);
        var sut = CreateSut();

        await sut.Invoking(h => h.Handle(new UpdateProviderCommand(99, "N", "https://x.com"), CancellationToken.None))
            .Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task DeleteProvider_RemovesProviderAndSaves()
    {
        var provider = new Provider { Id = 4 };
        _providers.GetByIdAsync(4, Arg.Any<CancellationToken>()).Returns(provider);
        var sut = CreateSut();

        await sut.Handle(new DeleteProviderCommand(4), CancellationToken.None);

        _providers.Received(1).Delete(provider);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteProvider_WhenNotFound_ThrowsNotFoundException()
    {
        _providers.GetByIdAsync(99, Arg.Any<CancellationToken>()).Returns((Provider?)null);
        var sut = CreateSut();

        await sut.Invoking(h => h.Handle(new DeleteProviderCommand(99), CancellationToken.None))
            .Should().ThrowAsync<NotFoundException>();
    }
}
