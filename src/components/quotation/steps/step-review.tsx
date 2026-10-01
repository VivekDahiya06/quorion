import { formatINR } from "@/lib/quote-calculation";
import type { ClientDetails } from "@/lib/quotation-pdf";
import type { QuoteTotals } from "@/types/quote-calculation.types";
import { SectionEyebrow } from "../section-eyebrow";
import { StepHeading } from "../step-heading";

function preparedForDetails(client: ClientDetails) {
  return (
    [
      client.company.trim() && client.name.trim() ? client.name.trim() : "",
      client.email.trim(),
      client.phone.trim(),
      client.gstin.trim() ? `GSTIN ${client.gstin.trim()}` : "",
      client.state.trim() ? `Place of supply: ${client.state.trim()}` : "",
    ]
      .filter(Boolean)
      .join(" · ") || "Client details can be added in the previous step."
  );
}

export function StepReview({
  quote,
  client,
  reference,
  quoteDate,
  isDownloading,
  downloadError,
  onDownload,
}: {
  quote: QuoteTotals;
  client: ClientDetails;
  reference: string;
  quoteDate: Date | null;
  isDownloading: boolean;
  downloadError: string;
  onDownload: () => void;
}) {
  return (
    <>
      <StepHeading
        eyebrow="04 / Final review"
        title="A good thing in the making."
        description="Here's your quotation, ready for a final look. Download it whenever you are happy with the scope."
      />
      <div className="review-meta">
        <div>
          <SectionEyebrow>Quotation reference</SectionEyebrow>
          <strong className="num">{reference || "Generating…"}</strong>
        </div>
        <div>
          <SectionEyebrow>Issued on</SectionEyebrow>
          <strong>{quoteDate?.toLocaleDateString("en-IN") ?? "—"}</strong>
        </div>
        <span className="validity-badge">Valid for 30 days</span>
      </div>
      <div className="prepared-card">
        <span className="prepared-icon" aria-hidden="true">
          ↗
        </span>
        <div>
          <SectionEyebrow>Prepared for</SectionEyebrow>
          <strong>
            {client.company.trim() || client.name.trim() || "Client"}
          </strong>
          <p>{preparedForDetails(client)}</p>
        </div>
      </div>
      <div className="review-groups">
        {quote.groups.length === 0 && (
          <p className="empty-note">
            No features added yet. Go back to Configuration to build your scope.
          </p>
        )}
        {quote.groups.map((group) => (
          <section className="review-group" key={group.id}>
            <div className="review-group-heading">
              <strong>{group.name}</strong>
              <b className="num">{formatINR(group.total)}</b>
            </div>
            {group.lines.map((line, index) => (
              <div className="review-line" key={`${group.id}-${index}`}>
                <span>
                  <strong>{line.description}</strong>
                  <small>{line.detail}</small>
                </span>
                <b className="num">{formatINR(line.amount)}</b>
              </div>
            ))}
          </section>
        ))}
      </div>
      <div className="review-totals">
        <div>
          <span>Taxable subtotal</span>
          <b className="num">{formatINR(quote.subtotal)}</b>
        </div>
        <div>
          <span>
            CGST <small>9%</small>
          </span>
          <b className="num">{formatINR(quote.cgst)}</b>
        </div>
        <div>
          <span>
            SGST <small>9%</small>
          </span>
          <b className="num">{formatINR(quote.sgst)}</b>
        </div>
        <div className="review-grand">
          <span>
            Grand total <small>Incl. GST</small>
          </span>
          <b className="num">{formatINR(quote.grandTotal)}</b>
        </div>
      </div>
      <div className="terms-card">
        <SectionEyebrow>A few notes</SectionEyebrow>
        <p>
          50% advance to start, 25% at design sign-off, 25% before handover.
          Prices in INR, GST charged at 18% as applicable, third-party licences
          billed at actuals.
        </p>
        <small>
          Timelines confirmed after the kick-off call and content handover.
        </small>
      </div>
      <button
        type="button"
        className="button button-primary download-review"
        onClick={onDownload}
        disabled={quote.groups.length === 0 || isDownloading}
      >
        <span aria-hidden="true">↓</span>
        {isDownloading ? "Preparing your PDF…" : "Download quotation PDF"}
      </button>
      {downloadError && (
        <p className="error-message" role="alert">
          {downloadError}
        </p>
      )}
    </>
  );
}
