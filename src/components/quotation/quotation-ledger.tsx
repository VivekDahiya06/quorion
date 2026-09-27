import { formatINR } from "@/lib/quote-calculation";
import type { QuoteTotals } from "@/types/quote-calculation.types";
import { SectionEyebrow } from "./section-eyebrow";

export function QuotationLedger({
  quote,
  hasSelection,
  isDownloading,
  downloadError,
  onDownload,
}: {
  quote: QuoteTotals;
  hasSelection: boolean;
  isDownloading: boolean;
  downloadError: string;
  onDownload: () => void;
}) {
  return (
    <aside className="ledger glass" aria-label="Live quotation summary">
      <div className="ledger-header">
        <div>
          <SectionEyebrow>Live estimate</SectionEyebrow>
          <h2>Your ledger</h2>
        </div>
        <span className="updating">
          <span className="status-dot" /> Updating
        </span>
      </div>
      {quote.groups.length === 0 ? (
        <div className="ledger-empty">
          <span className="empty-orbit" aria-hidden="true">
            ✦
          </span>
          <strong>A blank canvas.</strong>
          <p>Pick a service and your estimate will take shape here.</p>
        </div>
      ) : (
        <div className="ledger-groups">
          {quote.groups.map((group) => (
            <div className="ledger-group" key={group.id}>
              <div className="ledger-group-title">
                <strong>{group.name}</strong>
                <b className="num">{formatINR(group.total)}</b>
              </div>
              <ul>
                {group.lines.map((line, index) => (
                  <li key={`${group.id}-line-${index}`}>
                    <span>{line.description}</span>
                    <b className="num">{formatINR(line.amount)}</b>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <div className="ledger-totals">
        <div>
          <span>Subtotal</span>
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
        <div className="ledger-grand gradient-total">
          <span>Grand total</span>
          <b className="num">{formatINR(quote.grandTotal)}</b>
        </div>
      </div>
      <button
        type="button"
        className="button button-outline ledger-download"
        onClick={onDownload}
        disabled={!hasSelection || isDownloading}
      >
        <span aria-hidden="true">↓</span>
        {isDownloading ? "Preparing PDF…" : "Download PDF"}
      </button>
      {downloadError && (
        <p className="error-message" role="alert">
          {downloadError}
        </p>
      )}
      <p className="ledger-note">
        <span aria-hidden="true">◈</span> Your PDF includes a clear GST
        breakdown.
      </p>
    </aside>
  );
}
