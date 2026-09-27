import { ADD_ONS } from "@/constants/quotation-catalog.constants";
import { formatINR } from "@/lib/quote-calculation";
import type { ClientDetails } from "@/lib/quotation-pdf";
import { SectionEyebrow } from "../section-eyebrow";
import { StepHeading } from "../step-heading";

const CLIENT_FIELDS: ReadonlyArray<
  readonly [keyof ClientDetails, string, string, string]
> = [
  ["company", "Company name", "e.g. Northstar Studio", "text"],
  ["name", "Contact person", "Full name", "text"],
  ["email", "Email address", "name@company.com", "email"],
  ["phone", "Phone number", "+91 98765 43210", "tel"],
  ["gstin", "GSTIN", "Optional", "text"],
  ["state", "Place of supply / state", "e.g. Karnataka", "text"],
];

function fieldAutoComplete(field: keyof ClientDetails) {
  if (field === "name") return "name";
  if (field === "company") return "organization";
  if (field === "email") return "email";
  if (field === "phone") return "tel";
  return "off";
}

export function StepAddOns({
  selected,
  chosenAddOns,
  client,
  onToggleAddOn,
  onChangeClient,
}: {
  selected: string[];
  chosenAddOns: string[];
  client: ClientDetails;
  onToggleAddOn: (addOnId: string) => void;
  onChangeClient: (field: keyof ClientDetails, value: string) => void;
}) {
  const visibleAddOns = ADD_ONS.filter(
    (addOn) =>
      chosenAddOns.includes(addOn.id) ||
      addOn.triggers.some((id) => selected.includes(id)),
  );

  return (
    <>
      <StepHeading
        eyebrow="03 / Add-ons & billing"
        title="The finishing touches"
        description="A few thoughtful extras can make the whole project work harder. Add any that feel right."
      />
      <SectionEyebrow>Recommended for your scope</SectionEyebrow>
      <div className="addon-list">
        {visibleAddOns.map((addOn) => {
          const isChosen = chosenAddOns.includes(addOn.id);
          return (
            <article
              className={`addon-card${isChosen ? " selected" : ""}`}
              key={addOn.id}
            >
              <span className="addon-symbol" aria-hidden="true">
                ✦
              </span>
              <div className="addon-copy">
                <strong>{addOn.name}</strong>
                <p>{addOn.note}</p>
              </div>
              <div className="addon-price">
                <strong className="num">{formatINR(addOn.price)}</strong>
                {addOn.suffix && <small>{addOn.suffix}</small>}
              </div>
              <button
                type="button"
                className={
                  isChosen
                    ? "button button-quiet addon-action"
                    : "button button-outline addon-action"
                }
                onClick={() => onToggleAddOn(addOn.id)}
                aria-pressed={isChosen}
              >
                {isChosen ? "Remove" : "Add"}
              </button>
            </article>
          );
        })}
        {visibleAddOns.length === 0 && (
          <p className="empty-note">
            Your selected services do not have suggested extras. You can continue
            to your quotation.
          </p>
        )}
      </div>

      <div className="billing-section">
        <SectionEyebrow>
          Billing details <span className="optional-label">Optional</span>
        </SectionEyebrow>
        <div className="form-grid">
          {CLIENT_FIELDS.map(([field, label, placeholder, type]) => (
            <label className="field" key={field}>
              {label}
              <input
                type={type}
                value={client[field]}
                placeholder={placeholder}
                onChange={(event) => onChangeClient(field, event.target.value)}
                autoComplete={fieldAutoComplete(field)}
              />
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
