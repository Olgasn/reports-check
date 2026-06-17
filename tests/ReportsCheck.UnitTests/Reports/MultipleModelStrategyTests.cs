using FluentAssertions;
using ReportsCheck.Application.Reports.Models;
using ReportsCheck.Application.Reports.Strategies;
using ReportsCheck.Domain.Entities;

namespace ReportsCheck.UnitTests.Reports;

/// <summary>
/// Покрывает сведение данных мультимодельной стратегии: оно должно быть устойчиво
/// к по-отчётным сбоям отдельных моделей и не терять успешные результаты.
/// </summary>
public class MultipleModelStrategyTests
{
    private static CheckResult Result(
        int studentId, string modelName, int grade = 7,
        string answer = "ответ", int input = 10, int output = 20, decimal cost = 0.5m) =>
        new()
        {
            Student = new Student { Id = studentId, Name = "Анна", Surname = "Сидорова", Middlename = "Павловна" },
            Model = new Model { Name = modelName },
            Grade = grade,
            Review = "ревью",
            Advantages = ["плюс"],
            Disadvantages = ["минус"],
            Answer = answer,
            InputTokens = input,
            OutputTokens = output,
            Cost = cost,
        };

    [Fact]
    public void PrepareMultipleData_AggregatesAllModelsPerReport()
    {
        CheckResult?[] modelA = [Result(1, "a", grade: 7, input: 10, output: 20, cost: 0.5m)];
        CheckResult?[] modelB = [Result(1, "b", grade: 9, input: 5, output: 7, cost: 0.25m)];

        var reviewData = MultipleModelStrategy.PrepareMultipleData([modelA, modelB]);

        reviewData.Should().HaveCount(1);
        reviewData[0].Result.Should().HaveCount(2);
        reviewData[0].Result.Select(r => r.ModelName).Should().Equal("a", "b");
        reviewData[0].Answer.Should().Be("ответ");
        // Токены и стоимость суммируются по всем промежуточным моделям.
        reviewData[0].InputTokens.Should().Be(15);
        reviewData[0].OutputTokens.Should().Be(27);
        reviewData[0].Cost.Should().Be(0.75m);
    }

    [Fact]
    public void PrepareMultipleData_KeepsSucceededModels_WhenOneModelFailsForReport()
    {
        // Модель B не справилась с отчётом (null), модель A — успешно.
        CheckResult?[] modelA = [Result(1, "a", grade: 6)];
        CheckResult?[] modelB = [null];

        var reviewData = MultipleModelStrategy.PrepareMultipleData([modelA, modelB]);

        reviewData.Should().HaveCount(1);
        reviewData[0].Result.Should().HaveCount(1);
        reviewData[0].Result[0].ModelName.Should().Be("a");
    }

    [Fact]
    public void PrepareMultipleData_SkipsReport_WhenAllModelsFailed_ButKeepsOthers()
    {
        // Два отчёта: для первого все модели упали, для второго обе успешны.
        CheckResult?[] modelA = [null, Result(2, "a")];
        CheckResult?[] modelB = [null, Result(2, "b")];

        var reviewData = MultipleModelStrategy.PrepareMultipleData([modelA, modelB]);

        // Первый отчёт пропущен (сводить нечего), второй сведён по обеим моделям.
        reviewData.Should().HaveCount(1);
        reviewData[0].Student.Id.Should().Be(2);
        reviewData[0].Result.Should().HaveCount(2);
    }

    [Fact]
    public void PrepareMultipleData_ReturnsEmpty_WhenNoBatches()
    {
        var reviewData = MultipleModelStrategy.PrepareMultipleData([]);

        reviewData.Should().BeEmpty();
    }
}
