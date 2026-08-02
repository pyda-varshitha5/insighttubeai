import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const runtime = "nodejs";

interface ExportPdfRequestBody {
  title?: string;
  markdown?: string;
}

/* --------------------------------------------------------------------- */
/*  Minimal, dependency-free Markdown -> HTML converter                   */
/*  Supports: headings, paragraphs, bold, italic, inline code,            */
/*  fenced code blocks, blockquotes, horizontal rules, bullet lists,      */
/*  numbered lists, tables, line breaks.                                  */
/* --------------------------------------------------------------------- */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(text: string): string {
  let escaped = escapeHtml(text);

  // Inline code (must run before bold/italic so markers inside code aren't touched)
  escaped = escaped.replace(/`([^`]+)`/g, (_match, code) => {
    return `<code class="inline-code">${code}</code>`;
  });

  // Bold (**text** or __text__)
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  escaped = escaped.replace(/__([^_]+)__/g, "<strong>$1</strong>");

  // Italic (*text* or _text_)
  escaped = escaped.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  escaped = escaped.replace(/(^|[^_])_([^_]+)_(?!_)/g, "$1<em>$2</em>");

  // Links [text](url)
  escaped = escaped.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2">$1</a>'
  );

  return escaped;
}

function isTableSeparatorRow(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes("-")) return false;
  const cells = trimmed
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|");
  return cells.every((cell) => /^\s*:?-+:?\s*$/.test(cell));
}

function parseTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function markdownToHtml(markdown: string): string {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  const htmlParts: string[] = [];

  let i = 0;
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = "";

  let listStack: { type: "ul" | "ol"; indent: number }[] = [];

  function closeLists() {
    while (listStack.length > 0) {
      const top = listStack.pop()!;
      htmlParts.push(top.type === "ul" ? "</ul>" : "</ol>");
    }
  }

  function openOrContinueList(type: "ul" | "ol", indent: number) {
    const current = listStack[listStack.length - 1];
    if (!current || current.indent < indent) {
      htmlParts.push(type === "ul" ? "<ul>" : "<ol>");
      listStack.push({ type, indent });
    } else if (current.type !== type && current.indent === indent) {
      htmlParts.push(current.type === "ul" ? "</ul>" : "</ol>");
      listStack.pop();
      htmlParts.push(type === "ul" ? "<ul>" : "<ol>");
      listStack.push({ type, indent });
    } else {
      while (
        listStack.length > 0 &&
        listStack[listStack.length - 1].indent > indent
      ) {
        const popped = listStack.pop()!;
        htmlParts.push(popped.type === "ul" ? "</ul>" : "</ol>");
      }
    }
  }

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine;

    // Fenced code block
    const fenceMatch = line.match(/^\s*```(.*)$/);
    if (fenceMatch) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = fenceMatch[1].trim();
        codeBlockLines = [];
      } else {
        inCodeBlock = false;
        closeLists();
        const langClass = codeBlockLang
          ? ` class="language-${escapeHtml(codeBlockLang)}"`
          : "";
        htmlParts.push(
          `<pre class="code-block"><code${langClass}>${escapeHtml(
            codeBlockLines.join("\n")
          )}</code></pre>`
        );
        codeBlockLang = "";
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      i++;
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      closeLists();
      i++;
      continue;
    }

    // Horizontal rule
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      closeLists();
      htmlParts.push("<hr />");
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeLists();
      const level = headingMatch[1].length;
      htmlParts.push(
        `<h${level}>${renderInline(headingMatch[2].trim())}</h${level}>`
      );
      i++;
      continue;
    }

    // Blockquote
    if (/^\s*>\s?/.test(line)) {
      closeLists();
      const quoteLines: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      htmlParts.push(
        `<blockquote>${quoteLines
          .map((ql) => `<p>${renderInline(ql)}</p>`)
          .join("")}</blockquote>`
      );
      continue;
    }

    // Table
    if (
      line.trim().startsWith("|") &&
      i + 1 < lines.length &&
      isTableSeparatorRow(lines[i + 1])
    ) {
      closeLists();
      const headerCells = parseTableRow(line);
      i += 2;
      const bodyRows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        bodyRows.push(parseTableRow(lines[i]));
        i++;
      }
      let tableHtml = '<table class="md-table"><thead><tr>';
      for (const cell of headerCells) {
        tableHtml += `<th>${renderInline(cell)}</th>`;
      }
      tableHtml += "</tr></thead><tbody>";
      for (const row of bodyRows) {
        tableHtml += "<tr>";
        for (const cell of row) {
          tableHtml += `<td>${renderInline(cell)}</td>`;
        }
        tableHtml += "</tr>";
      }
      tableHtml += "</tbody></table>";
      htmlParts.push(tableHtml);
      continue;
    }

    // Numbered list
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (olMatch) {
      const indent = olMatch[1].length;
      openOrContinueList("ol", indent);
      htmlParts.push(`<li>${renderInline(olMatch[2])}</li>`);
      i++;
      continue;
    }

    // Bullet list
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.*)$/);
    if (ulMatch) {
      const indent = ulMatch[1].length;
      openOrContinueList("ul", indent);
      htmlParts.push(`<li>${renderInline(ulMatch[2])}</li>`);
      i++;
      continue;
    }

    // Paragraph (collect consecutive plain lines)
    closeLists();
    const paragraphLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^\s*```/.test(lines[i]) &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i]) &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith("|")
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }
    htmlParts.push(
      `<p>${paragraphLines.map((pl) => renderInline(pl)).join("<br />")}</p>`
    );
  }

  closeLists();

  if (inCodeBlock) {
    const langClass = codeBlockLang
      ? ` class="language-${escapeHtml(codeBlockLang)}"`
      : "";
    htmlParts.push(
      `<pre class="code-block"><code${langClass}>${escapeHtml(
        codeBlockLines.join("\n")
      )}</code></pre>`
    );
  }

  return htmlParts.join("\n");
}

function buildFullHtmlDocument(title: string, bodyHtml: string): string {
  const safeTitle = escapeHtml(title);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${safeTitle}</title>
<style>
  @page {
    size: A4;
    margin: 20mm 18mm;
  }

  * {
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Helvetica, Arial, sans-serif;
    font-size: 12px;
    line-height: 1.6;
    color: #1a1a1a;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.3;
    margin-top: 1.4em;
    margin-bottom: 0.5em;
    page-break-after: avoid;
    color: #111111;
  }

  h1 { font-size: 24px; border-bottom: 2px solid #e2e2e2; padding-bottom: 8px; }
  h2 { font-size: 20px; border-bottom: 1px solid #e8e8e8; padding-bottom: 6px; }
  h3 { font-size: 17px; }
  h4 { font-size: 15px; }
  h5 { font-size: 13px; }
  h6 { font-size: 12px; color: #555555; }

  p {
    margin: 0.6em 0;
    orphans: 3;
    widows: 3;
  }

  strong { font-weight: 700; }
  em { font-style: italic; }

  a {
    color: #2563eb;
    text-decoration: underline;
  }

  ul, ol {
    margin: 0.5em 0 0.9em 0;
    padding-left: 1.6em;
  }

  li {
    margin: 0.25em 0;
  }

  blockquote {
    margin: 0.9em 0;
    padding: 0.4em 1em;
    border-left: 4px solid #d1d5db;
    background-color: #f9fafb;
    color: #374151;
  }

  blockquote p {
    margin: 0.3em 0;
  }

  hr {
    border: none;
    border-top: 1px solid #e2e2e2;
    margin: 1.6em 0;
  }

  code.inline-code {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo,
      monospace;
    background-color: #f1f1f1;
    padding: 0.15em 0.4em;
    border-radius: 4px;
    font-size: 0.9em;
    color: #c7254e;
  }

  pre.code-block {
    background-color: #0f172a;
    color: #e2e8f0;
    padding: 14px 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0.9em 0;
    page-break-inside: avoid;
  }

  pre.code-block code {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo,
      monospace;
    font-size: 11px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    background: none;
    color: inherit;
    padding: 0;
  }

  table.md-table {
    border-collapse: collapse;
    width: 100%;
    margin: 0.9em 0;
    page-break-inside: avoid;
    font-size: 11.5px;
  }

  table.md-table th,
  table.md-table td {
    border: 1px solid #d1d5db;
    padding: 6px 10px;
    text-align: left;
    vertical-align: top;
  }

  table.md-table th {
    background-color: #f3f4f6;
    font-weight: 600;
  }

  .doc-title {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 0.2em;
    color: #111111;
  }

  .doc-title-divider {
    border: none;
    border-top: 3px solid #2563eb;
    width: 60px;
    margin: 0.6em 0 1.4em 0;
  }
</style>
</head>
<body>
  <div class="doc-title">${safeTitle}</div>
  <hr class="doc-title-divider" />
  ${bodyHtml}
</body>
</html>`;
}

function sanitizeFileName(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 0 ? cleaned : "Summary";
}

export async function POST(req: NextRequest) {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    const body: ExportPdfRequestBody = await req.json();
    const { title, markdown } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'title' in request body." },
        { status: 400 }
      );
    }

    if (!markdown || typeof markdown !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'markdown' in request body." },
        { status: 400 }
      );
    }

    const bodyHtml = markdownToHtml(markdown);
    const fullHtml = buildFullHtmlDocument(title, bodyHtml);

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();

    await page.setContent(fullHtml, {
  waitUntil: "load",
});

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "18mm",
        right: "18mm",
      },
      preferCSSPageSize: true,
    });

    await browser.close();
    browser = null;

    const fileName = `${sanitizeFileName(title)}.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF export failed:", error);

    if (browser) {
      try {
        await browser.close();
      } catch {
        // ignore secondary close error
      }
    }

    return NextResponse.json(
      { error: "Failed to generate PDF." },
      { status: 500 }
    );
  }
}