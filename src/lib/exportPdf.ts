import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import MarkdownIt from "markdown-it";

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
});

export function exportMarkdownToPdf(title: string, markdown: string) {
  const html = md.render(markdown);

  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 50, 40, 50],

    content: [
      {
        text: title,
        style: "title",
      },
      {
        text: "AI Generated Study Guide",
        style: "subtitle",
      },
      {
        text,
        style: "body",
      },
    ],

    styles: {
      title: {
        fontSize: 24,
        bold: true,
        margin: [0, 0, 0, 10],
      },

      subtitle: {
        fontSize: 12,
        color: "#666666",
        margin: [0, 0, 0, 20],
      },

      body: {
        fontSize: 11,
        lineHeight: 1.5,
      },
    },

    defaultStyle: {
      font: "Roboto",
    },
  };

  pdfMake.createPdf(docDefinition).download(`${title}.pdf`);
}