using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReportsCheck.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRepositoriesAndAppSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GitHubUsername",
                table: "Students",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Number",
                table: "Students",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Abbreviation",
                table: "Courses",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "AppSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    GitHubToken = table.Column<string>(type: "TEXT", nullable: false),
                    GitHubOrg = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "IT-GSTU"),
                    GitHubOwner = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "olgasn"),
                    RepoPrivate = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: true),
                    SmtpServer = table.Column<string>(type: "TEXT", nullable: false),
                    SmtpPort = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 587),
                    SenderName = table.Column<string>(type: "TEXT", nullable: false),
                    SenderEmail = table.Column<string>(type: "TEXT", nullable: false),
                    SmtpPassword = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StudentRepositories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Url = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    Error = table.Column<string>(type: "TEXT", nullable: true),
                    InvitationEmailed = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EmailedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    StudentId = table.Column<int>(type: "INTEGER", nullable: false),
                    CourseId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentRepositories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentRepositories_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StudentRepositories_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StudentRepositories_CourseId",
                table: "StudentRepositories",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentRepositories_StudentId_CourseId",
                table: "StudentRepositories",
                columns: new[] { "StudentId", "CourseId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppSettings");

            migrationBuilder.DropTable(
                name: "StudentRepositories");

            migrationBuilder.DropColumn(
                name: "GitHubUsername",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "Number",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "Abbreviation",
                table: "Courses");
        }
    }
}
