import { SERVICES } from "@/constants/quotation-catalog.constants";
import { formatINR } from "@/lib/quote-calculation";
import { StepHeading } from "../step-heading";

function serviceSymbol(name: string) {
  if (name === "Web Development") return "↗";
  if (name === "UI / UX Design") return "⌘";
  if (name === "Graphic Design") return "◈";
  return "▶";
}

export function StepServices({
  selected,
  onToggleService,
}: {
  selected: string[];
  onToggleService: (serviceId: string) => void;
}) {
  return (
    <>
      <StepHeading
        eyebrow="01 / Services"
        title="What are we making?"
        description="Choose the services that bring your next idea to life. You can mix and match as much as you need."
      />
      <div className="service-grid">
        {SERVICES.map((service) => {
          const isSelected = selected.includes(service.id);
          return (
            <button
              key={service.id}
              type="button"
              className={`service-card${isSelected ? " selected" : ""}`}
              onClick={() => onToggleService(service.id)}
              aria-pressed={isSelected}
            >
              <span className="service-card-top">
                <span className="service-symbol" aria-hidden="true">
                  {serviceSymbol(service.name)}
                </span>
                <span
                  className={`selection-indicator${isSelected ? " checked" : ""}`}
                  aria-hidden="true"
                >
                  {isSelected ? "✓" : "+"}
                </span>
              </span>
              <strong>{service.name}</strong>
              <span className="service-tagline">{service.tagline}</span>
              <span className="service-price">
                <small>FROM</small>
                <b className="num">{formatINR(service.basePrice)}</b>
              </span>
              {isSelected && (
                <span className="added-label">
                  <span className="status-dot" /> Added to quotation
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="selection-hint">
        <span className="status-dot" />{" "}
        {selected.length
          ? `${selected.length} service${selected.length === 1 ? "" : "s"} in your scope`
          : "Select at least one service to begin"}
      </div>
    </>
  );
}
