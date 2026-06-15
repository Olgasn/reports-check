using FluentAssertions;
using FluentValidation;
using MediatR;
using ReportsCheck.Application.Common.Behaviors;

namespace ReportsCheck.UnitTests.Common;

public class ValidationBehaviorTests
{
    private record TestRequest(string Value) : IRequest<string>;

    private class NonEmptyValidator : AbstractValidator<TestRequest>
    {
        public NonEmptyValidator() => RuleFor(x => x.Value).NotEmpty();
    }

    [Fact]
    public async Task Handle_WhenNoValidators_PassesThroughToNext()
    {
        var behavior = new ValidationBehavior<TestRequest, string>([]);
        var called = false;
        RequestHandlerDelegate<string> next = _ =>
        {
            called = true;
            return Task.FromResult("ok");
        };

        var result = await behavior.Handle(new TestRequest("любое"), next, CancellationToken.None);

        result.Should().Be("ok");
        called.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_WhenValidRequest_PassesThroughToNext()
    {
        var behavior = new ValidationBehavior<TestRequest, string>([new NonEmptyValidator()]);
        RequestHandlerDelegate<string> next = _ => Task.FromResult("ok");

        var result = await behavior.Handle(new TestRequest("непустое"), next, CancellationToken.None);

        result.Should().Be("ok");
    }

    [Fact]
    public async Task Handle_WhenInvalidRequest_ThrowsValidationException()
    {
        var behavior = new ValidationBehavior<TestRequest, string>([new NonEmptyValidator()]);
        RequestHandlerDelegate<string> next = _ => Task.FromResult("never");

        await behavior.Invoking(b => b.Handle(new TestRequest(string.Empty), next, CancellationToken.None))
            .Should().ThrowAsync<ValidationException>()
            .WithMessage("*Value*");
    }

    [Fact]
    public async Task Handle_WhenMultipleValidatorsAllFail_CollectsAllErrors()
    {
        var behavior = new ValidationBehavior<TestRequest, string>(
        [
            new NonEmptyValidator(),
            new NonEmptyValidator(),
        ]);
        RequestHandlerDelegate<string> next = _ => Task.FromResult("never");

        var ex = await Assert.ThrowsAsync<ValidationException>(
            () => behavior.Handle(new TestRequest(string.Empty), next, CancellationToken.None));

        ex.Errors.Should().HaveCountGreaterThanOrEqualTo(2);
    }
}
