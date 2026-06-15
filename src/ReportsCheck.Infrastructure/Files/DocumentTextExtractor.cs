using System.Text;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using ReportsCheck.Application.Files;
using UglyToad.PdfPig;

namespace ReportsCheck.Infrastructure.Files;

/// <summary>
/// Извлечение текста из PDF (PdfPig), DOCX (OpenXml) и TXT (UTF-8).
/// Порт FileService.parseFile / extractPDF / extractDOCX.
/// </summary>
public class DocumentTextExtractor : IDocumentTextExtractor
{
    public Task<string> ExtractTextAsync(string fileName, byte[] content, CancellationToken cancellationToken = default)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        var text = ext switch
        {
            ".pdf" => ExtractPdf(content),
            ".docx" => ExtractDocx(content),
            _ => Encoding.UTF8.GetString(content),
        };

        return Task.FromResult(text);
    }

    private static string ExtractPdf(byte[] content)
    {
        using var document = PdfDocument.Open(content);
        var sb = new StringBuilder();

        foreach (var page in document.GetPages())
        {
            sb.AppendLine(page.Text);
        }

        return sb.ToString();
    }

    private static string ExtractDocx(byte[] content)
    {
        using var stream = new MemoryStream(content);
        using var document = WordprocessingDocument.Open(stream, false);

        var body = document.MainDocumentPart?.Document?.Body;
        if (body is null)
        {
            return string.Empty;
        }

        var paragraphs = body.Descendants<Paragraph>().Select(p => p.InnerText);
        return string.Join("\n", paragraphs);
    }
}
