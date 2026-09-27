import { STUDIO } from "@/constants/quotation-catalog.constants";
import type { ClientDetails } from "@/lib/quotation-pdf";

export function QuotationTopbar({
  client,
  reference,
}: {
  client: ClientDetails;
  reference: string;
}) {
  return (
    <header className="topbar">
      <div className="brand-lockup">
        <span className="brand-mark" aria-hidden="true">
          Q
        </span>
        <div className="brand-copy">
          <strong>{STUDIO.name}</strong>
          <span>{STUDIO.descriptor}</span>
        </div>
      </div>
      <div className="header-meta">
        <span className="client-pill">
          <span className="status-dot" />
          {client.company || client.name || "New quotation"}
        </span>
        <span className="header-reference num">
          {reference ? reference.slice(-4) : "----"}
        </span>
      </div>
    </header>
  );
}
