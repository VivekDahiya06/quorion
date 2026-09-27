import {
    QUOTATION_PDF_COLORS,
    QUOTATION_PDF_LAYOUT,
    QUOTATION_PDF_FONT_SIZES,
    QUOTATION_PDF_DATE_LOCALE,
} from "@/constants/quotation-pdf.constants";
import { APP_CONSTANTS } from "@/constants/app.constants";
import type { QuoteTotals } from "@/types/quote-calculation.types";
import { QUOTATION_TERMS, STUDIO } from "@/constants/quotation-catalog.constants";

export type ClientDetails = {
  name: string;
  company: string;
  email: string;
  phone: string;
  gstin: string;
  state: string;
};

export async function downloadQuotationPdf(
  quote: QuoteTotals,
  client: ClientDetails,
  reference: string,
  date: Date,
) {
  const { jsPDF: JsPDF } = await import("jspdf");
  const pdf = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = QUOTATION_PDF_LAYOUT.PAGE_WIDTH;
  const left = QUOTATION_PDF_LAYOUT.MARGIN_LEFT;
  const right = QUOTATION_PDF_LAYOUT.MARGIN_RIGHT;
  const contentWidth = right - left;
  const bottom = QUOTATION_PDF_LAYOUT.CONTENT_BOTTOM;
  let y: number = QUOTATION_PDF_LAYOUT.CONTENT_TOP;

  const drawPageHeader = () => {
    pdf.setFillColor(...QUOTATION_PDF_COLORS.HEADER_BG);
    pdf.rect(0, 0, pageWidth, QUOTATION_PDF_LAYOUT.HEADER_HEIGHT, "F");
    pdf.setTextColor(...QUOTATION_PDF_COLORS.WHITE);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(QUOTATION_PDF_FONT_SIZES.STUDIO_NAME);
    pdf.text(STUDIO.name, left, 12);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(QUOTATION_PDF_FONT_SIZES.STUDIO_DESCRIPTOR);
    pdf.text(STUDIO.descriptor, left, 19);
    pdf.text(`GSTIN ${STUDIO.gstin} | ${STUDIO.email}`, right, 18, {
      align: "right",
    });
    pdf.setTextColor(...QUOTATION_PDF_COLORS.TEXT_PRIMARY);
    y = QUOTATION_PDF_LAYOUT.CONTENT_START_Y;
  };

  const ensureSpace = (height: number) => {
    if (y + height <= bottom) return;
    pdf.addPage();
    drawPageHeader();
  };

  const writeWrapped = (
    text: string,
    x: number,
    width: number,
    fontSize = 9,
    fontStyle: "normal" | "bold" = "normal",
  ) => {
    pdf.setFont("helvetica", fontStyle);
    pdf.setFontSize(fontSize);
    const lines = [...(pdf.splitTextToSize(text, width) as string[])];
    const lineHeight = fontSize * 0.42 + 1;
    while (lines.length > 0) {
      if (y + lineHeight > bottom) {
        pdf.addPage();
        drawPageHeader();
      }
      const lineCount = Math.max(1, Math.floor((bottom - y - 1) / lineHeight));
      const pageLines = lines.splice(0, lineCount);
      pdf.setFont("helvetica", fontStyle);
      pdf.setFontSize(fontSize);
      pdf.text(pageLines, x, y);
      y += pageLines.length * lineHeight;
      if (lines.length > 0) {
        pdf.addPage();
        drawPageHeader();
      }
    }
  };

  drawPageHeader();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(QUOTATION_PDF_FONT_SIZES.TITLE);
  pdf.text("QUOTATION", left, y);
  pdf.setFont("courier", "normal");
  pdf.setFontSize(QUOTATION_PDF_FONT_SIZES.REFERENCE);
  pdf.text(reference, right, y - 1, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(QUOTATION_PDF_FONT_SIZES.REFERENCE);
  pdf.text(date.toLocaleDateString(QUOTATION_PDF_DATE_LOCALE), right, y + 5, {
    align: "right",
  });
  y += 13;

  pdf.setDrawColor(...QUOTATION_PDF_COLORS.DIVIDER);
  pdf.line(left, y, right, y);
  y += 7;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(QUOTATION_PDF_FONT_SIZES.SECTION_LABEL);
  pdf.setTextColor(...QUOTATION_PDF_COLORS.LABEL_MUTED);
  pdf.text("PREPARED FOR", left, y);
  y += 6;
  pdf.setTextColor(...QUOTATION_PDF_COLORS.TEXT_PRIMARY);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(QUOTATION_PDF_FONT_SIZES.CLIENT_NAME);
  writeWrapped(
    client.company.trim() || client.name.trim() || "Client",
    left,
    contentWidth,
    QUOTATION_PDF_FONT_SIZES.CLIENT_NAME,
    "bold",
  );
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(QUOTATION_PDF_FONT_SIZES.BODY);
  const details = [
    client.company.trim() && client.name.trim() ? client.name.trim() : "",
    client.email.trim(),
    client.phone.trim(),
    client.gstin.trim() ? `GSTIN ${client.gstin.trim()}` : "",
    client.state.trim() ? `Place of supply: ${client.state.trim()}` : "",
  ].filter(Boolean);
  for (const detail of details) {
    writeWrapped(detail, left, contentWidth, QUOTATION_PDF_FONT_SIZES.BODY);
  }
  y += 5;

  pdf.setFillColor(...QUOTATION_PDF_COLORS.TABLE_HEADER_BG);
  pdf.rect(left, y, contentWidth, 8, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(QUOTATION_PDF_FONT_SIZES.SECTION_LABEL);
  pdf.setTextColor(...QUOTATION_PDF_COLORS.TABLE_HEADER_TEXT);
  pdf.text("DESCRIPTION", left + 3, y + 5.2);
  pdf.text("AMOUNT", right - 3, y + 5.2, { align: "right" });
  y += 10;

  for (const group of quote.groups) {
    ensureSpace(14);
    pdf.setFillColor(...QUOTATION_PDF_COLORS.GROUP_ROW_BG);
    pdf.rect(left, y - 3, contentWidth, 8, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(QUOTATION_PDF_FONT_SIZES.GROUP_HEADER);
    pdf.setTextColor(...QUOTATION_PDF_COLORS.TEXT_PRIMARY);
    pdf.text(group.name, left + 3, y + 2);
    pdf.text(formatPdfMoney(group.total), right - 3, y + 2, { align: "right" });
    y += 9;

    for (const line of group.lines) {
      const descriptionLines = pdf.splitTextToSize(
        line.description,
        contentWidth - 34,
      ) as string[];
      const detailLines = pdf.splitTextToSize(
        line.detail.replaceAll("₹", "Rs. "),
        contentWidth - 34,
      ) as string[];
      const rowHeight = Math.max(
        8,
        descriptionLines.length * 4 + detailLines.length * 3.5 + 2,
      );
      const rowTopPadding = 3;
      ensureSpace(rowHeight + rowTopPadding);
      const rowTextY = y + rowTopPadding;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(QUOTATION_PDF_FONT_SIZES.LINE_DESCRIPTION);
      pdf.setTextColor(...QUOTATION_PDF_COLORS.LINE_DESCRIPTION_TEXT);
      pdf.text(descriptionLines, left + 4, rowTextY);
      pdf.setFontSize(QUOTATION_PDF_FONT_SIZES.LINE_DETAIL);
      pdf.setTextColor(...QUOTATION_PDF_COLORS.LINE_DETAIL_TEXT);
      pdf.text(detailLines, left + 4, rowTextY + descriptionLines.length * 4);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(QUOTATION_PDF_FONT_SIZES.LINE_DESCRIPTION);
      pdf.setTextColor(...QUOTATION_PDF_COLORS.LINE_DESCRIPTION_TEXT);
      pdf.text(formatPdfMoney(line.amount), right - 3, rowTextY, {
        align: "right",
      });
      y += rowHeight + rowTopPadding;
      pdf.setDrawColor(...QUOTATION_PDF_COLORS.ROW_DIVIDER);
      pdf.line(left, y - 2, right, y - 2);
    }
    y += 2;
  }

  ensureSpace(33);
  const summaryRows = [
    ["Subtotal", quote.subtotal],
    ["CGST (9%)", quote.cgst],
    ["SGST (9%)", quote.sgst],
  ] as const;
  for (const [label, amount] of summaryRows) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(QUOTATION_PDF_FONT_SIZES.BODY);
    pdf.setTextColor(...QUOTATION_PDF_COLORS.TABLE_HEADER_TEXT);
    pdf.text(label, right - 60, y);
    pdf.setTextColor(...QUOTATION_PDF_COLORS.TEXT_PRIMARY);
    pdf.text(formatPdfMoney(amount), right - 3, y, { align: "right" });
    y += 6;
  }
  pdf.setFillColor(...QUOTATION_PDF_COLORS.SUMMARY_BOX_BG);
  pdf.roundedRect(right - 82, y - 3, 82, 13, 2, 2, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(QUOTATION_PDF_FONT_SIZES.GRAND_TOTAL);
  pdf.setTextColor(...QUOTATION_PDF_COLORS.GRAND_TOTAL_TEXT);
  pdf.text("GRAND TOTAL", right - 78, y + 5);
  pdf.text(formatPdfMoney(quote.grandTotal), right - 3, y + 5, {
    align: "right",
  });
  y += 19;

  ensureSpace(12);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(QUOTATION_PDF_FONT_SIZES.SECTION_LABEL);
  pdf.setTextColor(...QUOTATION_PDF_COLORS.LABEL_MUTED);
  pdf.text("TERMS", left, y);
  y += 6;
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...QUOTATION_PDF_COLORS.TABLE_HEADER_TEXT);
  for (const term of QUOTATION_TERMS) {
    writeWrapped(`- ${term}`, left, contentWidth, QUOTATION_PDF_FONT_SIZES.TERMS);
    y += 1;
  }

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(QUOTATION_PDF_FONT_SIZES.FOOTER);
    pdf.setTextColor(...QUOTATION_PDF_COLORS.FOOTER_TEXT);
    pdf.text(
      `${STUDIO.name} | ${reference}`,
      left,
      QUOTATION_PDF_LAYOUT.FOOTER_Y,
    );
    pdf.text(`${page} / ${pageCount}`, right, QUOTATION_PDF_LAYOUT.FOOTER_Y, {
      align: "right",
    });
  }

  pdf.save(`Quotation-${reference}.pdf`);
}

function formatPdfMoney(amount: number) {
    return `Rs. ${new Intl.NumberFormat(APP_CONSTANTS.LOCALE, { maximumFractionDigits: 0 }).format(Math.round(amount))}`;
}