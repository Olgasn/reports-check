using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReportsCheck.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTokenUsageAndPricing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "InputTokenPrice",
                table: "Models",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "OutputTokenPrice",
                table: "Models",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Cost",
                table: "Checks",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "InputTokens",
                table: "Checks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "OutputTokens",
                table: "Checks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InputTokenPrice",
                table: "Models");

            migrationBuilder.DropColumn(
                name: "OutputTokenPrice",
                table: "Models");

            migrationBuilder.DropColumn(
                name: "Cost",
                table: "Checks");

            migrationBuilder.DropColumn(
                name: "InputTokens",
                table: "Checks");

            migrationBuilder.DropColumn(
                name: "OutputTokens",
                table: "Checks");
        }
    }
}
