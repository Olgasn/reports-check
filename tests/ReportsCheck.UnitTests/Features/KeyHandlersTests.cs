using FluentAssertions;
using NSubstitute;
using ReportsCheck.Application.Common.Exceptions;
using ReportsCheck.Application.Features.Keys;
using ReportsCheck.Domain.Entities;
using ReportsCheck.Domain.Interfaces;

namespace ReportsCheck.UnitTests.Features;

public class KeyHandlersTests
{
    private readonly IRepository<Key> _keys = Substitute.For<IRepository<Key>>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();

    private KeyHandlers CreateSut() => new(_keys, _unitOfWork);

    [Fact]
    public async Task CreateKey_AddsKeyAndSaves()
    {
        var sut = CreateSut();

        await sut.Handle(new CreateKeyCommand("МойКлюч", "secret-value"), CancellationToken.None);

        await _keys.Received(1).AddAsync(
            Arg.Is<Key>(k => k.Name == "МойКлюч" && k.Value == "secret-value"),
            Arg.Any<CancellationToken>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateKey_UpdatesFieldsAndSaves()
    {
        var key = new Key { Id = 3, Name = "Старый", Value = "old" };
        _keys.GetByIdAsync(3, Arg.Any<CancellationToken>()).Returns(key);
        var sut = CreateSut();

        await sut.Handle(new UpdateKeyCommand(3, "Новый", "new-val"), CancellationToken.None);

        key.Name.Should().Be("Новый");
        key.Value.Should().Be("new-val");
        _keys.Received(1).Update(key);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateKey_WhenNotFound_ThrowsNotFoundException()
    {
        _keys.GetByIdAsync(99, Arg.Any<CancellationToken>()).Returns((Key?)null);
        var sut = CreateSut();

        await sut.Invoking(h => h.Handle(new UpdateKeyCommand(99, "Имя", "val"), CancellationToken.None))
            .Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task DeleteKey_RemovesKeyAndSaves()
    {
        var key = new Key { Id = 5 };
        _keys.GetByIdAsync(5, Arg.Any<CancellationToken>()).Returns(key);
        var sut = CreateSut();

        await sut.Handle(new DeleteKeyCommand(5), CancellationToken.None);

        _keys.Received(1).Delete(key);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteKey_WhenNotFound_ThrowsNotFoundException()
    {
        _keys.GetByIdAsync(99, Arg.Any<CancellationToken>()).Returns((Key?)null);
        var sut = CreateSut();

        await sut.Invoking(h => h.Handle(new DeleteKeyCommand(99), CancellationToken.None))
            .Should().ThrowAsync<NotFoundException>();
    }
}
