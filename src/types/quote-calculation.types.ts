export type QuoteConfig = Record<string, Record<string, number | boolean>>;

export type QuoteLine = {
    description: string;
    detail: string;
    amount: number;
};

export type QuoteGroup = {
    id: string;
    name: string;
    lines: QuoteLine[];
    total: number;
};

export type QuoteTotals = {
    groups: QuoteGroup[];
    subtotal: number;
    gst: number;
    cgst: number;
    sgst: number;
    grandTotal: number;
};