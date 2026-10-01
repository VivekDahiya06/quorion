import { SERVICES } from "@/constants/quotation-catalog.constants";
import { getServiceDefaults } from "@/lib/quotation-catalog";
import {
  calculateQuote,
  formatINR,
  readOptionValue,
} from "@/lib/quote-calculation";
import type { QuoteConfig } from "@/types/quote-calculation.types";
import type { Service } from "@/types/quote-catalog.types";
import { SectionEyebrow } from "../section-eyebrow";
import { StepHeading } from "../step-heading";

function ServiceConfiguration({
  service,
  config,
  onChangeOption,
}: {
  service: Service;
  config: QuoteConfig;
  onChangeOption: (
    serviceId: string,
    optionId: string,
    value: number | boolean,
  ) => void;
}) {
  const values = config[service.id] ?? getServiceDefaults(service);
  const serviceTotal = calculateQuote(
    [service.id],
    { [service.id]: values },
    [],
  ).subtotal;

  return (
    <div className="configuration-content tick" key={service.id}>
      <div className="scope-summary">
        <div>
          <SectionEyebrow>Selected service</SectionEyebrow>
          <h2>{service.name}</h2>
        </div>
        <div className="scope-total">
          <small>Service subtotal</small>
          <strong className="num">{formatINR(serviceTotal)}</strong>
        </div>
      </div>
      <div className="option-list">
        {service.options.map((option) => {
          const value = readOptionValue(values[option.id], option);
          const amount =
            option.kind === "toggle"
              ? value === true
                ? option.price
                : 0
              : Number(value) * option.unitPrice;
          return (
            <div className="option-row" key={option.id}>
              <div className="option-description">
                <strong>{option.name}</strong>
                <small>{option.note}</small>
                <span className="option-rate num">
                  {option.kind === "counter"
                    ? `${formatINR(option.unitPrice)} each`
                    : formatINR(option.price)}
                </span>
              </div>
              {option.kind === "counter" ? (
                <div className="option-control counter-control">
                  <button
                    type="button"
                    aria-label={`Decrease ${option.name}`}
                    onClick={() =>
                      onChangeOption(
                        service.id,
                        option.id,
                        Math.max(option.min, Number(value) - 1),
                      )
                    }
                    disabled={Number(value) <= option.min}
                  >
                    −
                  </button>
                  <span className="counter-value num" aria-live="polite">
                    {Number(value)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase ${option.name}`}
                    onClick={() =>
                      onChangeOption(
                        service.id,
                        option.id,
                        Math.min(option.max, Number(value) + 1),
                      )
                    }
                    disabled={Number(value) >= option.max}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={`switch${value === true ? " on" : ""}`}
                  role="switch"
                  aria-checked={value === true}
                  aria-label={option.name}
                  onClick={() =>
                    onChangeOption(service.id, option.id, value !== true)
                  }
                >
                  <span />
                </button>
              )}
              <strong className="option-amount num">{formatINR(amount)}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StepConfiguration({
  selected,
  config,
  activeService,
  unconfiguredServices,
  onSelectService,
  onChangeOption,
}: {
  selected: string[];
  config: QuoteConfig;
  activeService: string | null;
  unconfiguredServices: string[];
  onSelectService: (serviceId: string) => void;
  onChangeOption: (
    serviceId: string,
    optionId: string,
    value: number | boolean,
  ) => void;
}) {
  const service =
    SERVICES.find((item) => item.id === activeService) ??
    SERVICES.find((item) => selected.includes(item.id));
  const pendingNames = SERVICES.filter((item) =>
    unconfiguredServices.includes(item.id),
  ).map((item) => item.name);

  return (
    <>
      <StepHeading
        eyebrow="02 / Configuration"
        title="Shape the scope"
        description="Fine-tune the deliverables. Your estimate updates as you make changes."
      />
      <div
        className="service-tabs"
        role="group"
        aria-label="Services to configure"
      >
        {SERVICES.filter((item) => selected.includes(item.id)).map((item) => {
          const needsSetup = unconfiguredServices.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={activeService === item.id}
              className={`${activeService === item.id ? "active" : ""}${needsSetup ? " needs-setup" : ""}`}
              onClick={() => onSelectService(item.id)}
            >
              {item.name}
              {needsSetup && (
                <span className="sr-only"> (needs at least one feature)</span>
              )}
            </button>
          );
        })}
      </div>
      {pendingNames.length > 0 && (
        <p className="setup-hint" role="status">
          <span className="status-dot" aria-hidden="true" /> Add at least one
          feature to {pendingNames.join(", ")} to continue.
        </p>
      )}
      {service ? (
        <ServiceConfiguration
          service={service}
          config={config}
          onChangeOption={onChangeOption}
        />
      ) : (
        <p className="empty-note">Select a service to configure your scope.</p>
      )}
    </>
  );
}
