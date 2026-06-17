using FluentAssertions;
using ReportsCheck.Application.GitHub;

namespace ReportsCheck.UnitTests.GitHub;

public class RepositoryNamingTests
{
    [Fact]
    public void Build_CombinesGroupAbbreviationAndIdentifier()
    {
        var name = RepositoryNaming.Build("PI-21", "BD", "ivanov");

        name.Should().Be("PI-21_BD_ivanov");
    }

    [Fact]
    public void Build_TransliteratesCyrillicGroup()
    {
        var name = RepositoryNaming.Build("ПИ-21", "БД", "petrov");

        name.Should().Be("PI-21_BD_petrov");
    }

    [Fact]
    public void Build_OmitsIdentifierWhenNull()
    {
        var name = RepositoryNaming.Build("PI21", "OOP", null);

        name.Should().Be("PI21_OOP");
    }

    [Fact]
    public void Build_KeepsDotsAndUnderscoresInIdentifier()
    {
        var name = RepositoryNaming.Build("PI-21", "BD", "ivan.petrov_2021");

        name.Should().Be("PI-21_BD_ivan.petrov_2021");
    }

    [Theory]
    [InlineData("ivanov@example.com", "ivanov")]
    [InlineData("ivan.petrov@gstu.by", "ivan.petrov")]
    [InlineData("  ivanov@gstu.by  ", "ivanov")]
    [InlineData("ivanov", "ivanov")]
    [InlineData("", "")]
    [InlineData(null, "")]
    public void EmailLocalPart_ReturnsPartBeforeAtSign(string? email, string expected)
    {
        RepositoryNaming.EmailLocalPart(email).Should().Be(expected);
    }

    [Fact]
    public void Sanitize_ReplacesDisallowedCharactersWithSingleDash()
    {
        RepositoryNaming.Sanitize("a b/c").Should().Be("a-b-c");
    }

    [Fact]
    public void Sanitize_TrimsLeadingAndTrailingDashes()
    {
        RepositoryNaming.Sanitize(" (group) ").Should().Be("group");
    }

    [Fact]
    public void Sanitize_KeepsAllowedSymbols()
    {
        RepositoryNaming.Sanitize("Lab_01.test-2").Should().Be("Lab_01.test-2");
    }

    [Theory]
    [InlineData("Группа", "Gruppa")]
    [InlineData("Информатика", "Informatika")]
    [InlineData("Ёж", "Ezh")]
    public void Transliterate_MapsCyrillicToLatin(string input, string expected)
    {
        RepositoryNaming.Transliterate(input).Should().Be(expected);
    }

    [Fact]
    public void Build_SanitizesSpacesInsideParts()
    {
        var name = RepositoryNaming.Build("ИТ 21", "Базы Данных", "sidorov");

        // «ИТ 21» → «IT 21» → «IT-21»; «Базы Данных» → «Bazy Dannykh» → «Bazy-Dannykh».
        name.Should().Be("IT-21_Bazy-Dannykh_sidorov");
    }
}
