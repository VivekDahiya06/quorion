import { APP_CONSTANTS } from "@/constants/app.constants";
import type { ServiceOption } from "@/types/quote-catalog.types";
import { ADD_ONS, SERVICES } from "@/constants/quotation-catalog.constants";
import type { QuoteConfig, QuoteGroup, QuoteLine, QuoteTotals } from "@/types/quote-calculation.types";

// Unset options start empty: toggles off, counters at their minimum.
export function readOptionValue(
  value: number | boolean | undefined,
  option: ServiceOption,
) {
  if (option.kind === "toggle") {
    return value === true;
  }

  const quantity =
    typeof value === "number" && Number.isFinite(value) ? value : option.min;
  return Math.min(option.max, Math.max(option.min, Math.trunc(quantity)));
}

export function calculateQuote(
  selected: string[],
  config: QuoteConfig,
  chosenAddOns: string[],
): QuoteTotals {
  const groups: QuoteGroup[] = [];

  for (const serviceId of selected) {
    const service = SERVICES.find((item) => item.id === serviceId);
    if (!service) continue;

    const lines: QuoteLine[] = [];
    const values = config[service.id] ?? {};

    for (const option of service.options) {
      const value = readOptionValue(values[option.id], option);
      if (option.kind === "counter" && typeof value === "number" && value > 0) {
        lines.push({
          description: option.name,
          detail: `${value} × ₹${new Intl.NumberFormat(APP_CONSTANTS.LOCALE).format(option.unitPrice)}`,
          amount: value * option.unitPrice,
        });
      } else if (option.kind === "toggle" && value === true) {
        lines.push({
          description: option.name,
          detail: "One-time",
          amount: option.price,
        });
      }
    }

    // A selected service only appears in the quote once a feature is added.
    if (lines.length === 0) continue;

    groups.push({
      id: service.id,
      name: service.name,
      lines,
      total: lines.reduce((sum, line) => sum + line.amount, 0),
    });
  }

  const addOnLines = ADD_ONS.filter((addOn) =>
    chosenAddOns.includes(addOn.id),
  ).map((addOn) => ({
    description: addOn.name,
    detail: addOn.suffix ?? "One-time",
    amount: addOn.price,
  }));
  if (addOnLines.length > 0) {
    groups.push({
      id: "additional-services",
      name: "Additional services",
      lines: addOnLines,
      total: addOnLines.reduce((sum, line) => sum + line.amount, 0),
    });
  }

  const subtotal = groups.reduce((sum, group) => sum + group.total, 0);
  const gst = subtotal * 0.18;
  const cgst = gst / 2;
  const sgst = gst / 2;

  return { groups, subtotal, gst, cgst, sgst, grandTotal: subtotal + gst };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat(APP_CONSTANTS.LOCALE, {
    style: "currency",
    currency: APP_CONSTANTS.CURRENCY,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function createQuotationReference(
  date = new Date(),
  random = Math.random(),
): string {
  const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const suffix =
    Math.floor(Math.min(1 - Number.EPSILON, Math.max(0, random)) * 9000) + 1000;
  return `QRN-${yearMonth}-${suffix}`;
}
