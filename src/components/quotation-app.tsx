"use client";

import { STEPS } from "@/constants/app.constants";
import { getServiceDefaults, } from "../lib/quotation-catalog";
import type { QuoteConfig } from "@/types/quote-calculation.types";
import { type ReactNode, useState, useSyncExternalStore } from "react";
import { type ClientDetails, downloadQuotationPdf } from "../lib/quotation-pdf";
import { ADD_ONS, SERVICES, STUDIO } from "@/constants/quotation-catalog.constants";
import { calculateQuote, createQuotationReference, formatINR, } from "../lib/quote-calculation";

const EMPTY_CLIENT: ClientDetails = {
    name: "",
    company: "",
    email: "",
    phone: "",
    gstin: "",
    state: "",
};

const SERVER_IDENTITY = { reference: "", date: null as Date | null };
let browserIdentity: typeof SERVER_IDENTITY | undefined;

function subscribeToIdentity() {
    return () => {
    };
}

function getBrowserIdentity() {
    if (!browserIdentity) {
        const date = new Date();
        browserIdentity = { reference: createQuotationReference(date), date };
    }
    return browserIdentity;
}

function getServerIdentity() {
    return SERVER_IDENTITY;
}

function SectionEyebrow({ children }: { children: ReactNode }) {
    return <p className="eyebrow">{children}</p>;
}

function StepHeading({
                         eyebrow,
                         title,
                         description,
                     }: {
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <div className="step-heading slide-in">
            <SectionEyebrow>{eyebrow}</SectionEyebrow>
            <h1>{title}</h1>
            <p>{description}</p>
        </div>
    );
}

export default function QuotationApp() {
    const [step, setStep] = useState(1);
    const [selected, setSelected] = useState<string[]>([]);
    const [config, setConfig] = useState<QuoteConfig>({});
    const [activeService, setActiveService] = useState<string | null>(null);
    const [chosenAddOns, setChosenAddOns] = useState<string[]>([]);
    const [client, setClient] = useState<ClientDetails>(EMPTY_CLIENT);
    const { reference, date: quoteDate } = useSyncExternalStore(
        subscribeToIdentity,
        getBrowserIdentity,
        getServerIdentity,
    );
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState("");

    const quote = calculateQuote(selected, config, chosenAddOns);

    const toggleService = (serviceId: string) => {
        const isSelected = selected.includes(serviceId);
        if (isSelected) {
            const remaining = selected.filter((id) => id !== serviceId);
            setSelected(remaining);
            if (activeService === serviceId) setActiveService(remaining[0] ?? null);
            return;
        }

        const service = SERVICES.find((item) => item.id === serviceId);
        if (!service) return;
        setSelected([...selected, serviceId]);
        setConfig((current) =>
            current[serviceId]
                ? current
                : { ...current, [serviceId]: getServiceDefaults(service) },
        );
        if (!activeService) setActiveService(serviceId);
    };

    const changeOption = (
        serviceId: string,
        optionId: string,
        value: number | boolean,
    ) => {
        setConfig((current) => ({
            ...current,
            [serviceId]: { ...(current[serviceId] ?? {}), [optionId]: value },
        }));
    };

    const toggleAddOn = (addOnId: string) => {
        setChosenAddOns((current) =>
            current.includes(addOnId)
                ? current.filter((id) => id !== addOnId)
                : [...current, addOnId],
        );
    };

    const downloadPdf = async () => {
        if (!selected.length || !quoteDate || !reference) return;
        setIsDownloading(true);
        setDownloadError("");
        try {
            await downloadQuotationPdf(quote, client, reference, quoteDate);
        } catch (error) {
            setDownloadError(
                error instanceof Error
                    ? error.message
                    : "The quotation PDF could not be created.",
            );
        } finally {
            setIsDownloading(false);
        }
    };

    const goToStep = (nextStep: number) => {
        if (nextStep < 1 || nextStep > 4 || (!selected.length && nextStep > 1))
            return;
        setStep(nextStep);
    };

    return (
        <div className="app-shell">
            <div className="aurora-bg" aria-hidden="true"/>
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
            <span className="status-dot"/>
              {client.company || client.name || "New quotation"}
          </span>
                    <span className="header-reference num">
            {reference ? reference.slice(-4) : "----"}
          </span>
                </div>
            </header>

            <main className="main-grid">
                <nav className="step-rail glass" aria-label="Quotation steps">
                    <SectionEyebrow>Workspace</SectionEyebrow>
                    <ol>
                        {STEPS.map((item, index) => {
                            const stepNumber = index + 1;
                            const reachable = selected.length > 0 || stepNumber === 1;
                            return (
                                <li key={item.title}>
                                    <button
                                        className={`step-link${step === stepNumber ? " is-active" : ""}${step > stepNumber ? " is-complete" : ""}`}
                                        type="button"
                                        onClick={() => goToStep(stepNumber)}
                                        disabled={!reachable}
                                        aria-current={step === stepNumber ? "step" : undefined}
                                    >
                    <span className="step-number num">
                      {step > stepNumber ? "✓" : `0${stepNumber}`}
                    </span>
                                        <span className="step-copy">
                      <strong>{item.title}</strong>
                      <small>{item.note}</small>
                    </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                    <div className="rail-footnote">
            <span className="mini-sparkle" aria-hidden="true">
              ✦
            </span>{" "}
                        Built for thoughtful work.
                    </div>
                </nav>

                <section className="workflow glass" aria-live="polite">
                    {step === 1 && (
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
                                            onClick={() => toggleService(service.id)}
                                            aria-pressed={isSelected}
                                        >
                      <span className="service-card-top">
                        <span className="service-symbol" aria-hidden="true">
                          {service.name === "Web Development"
                              ? "↗"
                              : service.name === "UI / UX Design"
                                  ? "⌘"
                                  : service.name === "Graphic Design"
                                      ? "◈"
                                      : "▶"}
                        </span>
                        <span
                            className={`selection-indicator${isSelected ? " checked" : ""}`}
                            aria-hidden="true"
                        >
                          {isSelected ? "✓" : "+"}
                        </span>
                      </span>
                                            <strong>{service.name}</strong>
                                            <span
                                                className="service-tagline">{service.tagline}</span>
                                            <span className="service-price">
                        <small>FROM</small>
                        <b className="num">{formatINR(service.basePrice)}</b>
                      </span>
                                            {isSelected && (
                                                <span className="added-label">
                          <span className="status-dot"/> Added to quotation
                        </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="selection-hint">
                                <span className="status-dot"/>{" "}
                                {selected.length
                                    ? `${selected.length} service${selected.length === 1 ? "" : "s"} in your scope`
                                    : "Select at least one service to begin"}
                            </div>
                        </>
                    )}

                    {step === 2 && (
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
                                {SERVICES.filter((service) =>
                                    selected.includes(service.id),
                                ).map((service) => (
                                    <button
                                        key={service.id}
                                        type="button"
                                        aria-pressed={activeService === service.id}
                                        className={activeService === service.id ? "active" : ""}
                                        onClick={() => setActiveService(service.id)}
                                    >
                                        {service.name}
                                    </button>
                                ))}
                            </div>
                            {(() => {
                                const service =
                                    SERVICES.find((item) => item.id === activeService) ??
                                    SERVICES.find((item) => selected.includes(item.id));
                                if (!service)
                                    return (
                                        <p className="empty-note">
                                            Select a service to configure your scope.
                                        </p>
                                    );
                                const values =
                                    config[service.id] ?? getServiceDefaults(service);
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
                                                <strong className="num">
                                                    {formatINR(serviceTotal)}
                                                </strong>
                                            </div>
                                        </div>
                                        <div className="base-line">
                      <span>
                        <strong>Discovery, project management and QA</strong>
                        <small>
                          Core engagement · project planning, coordination and
                          quality review
                        </small>
                      </span>
                                            <b className="num">{formatINR(service.basePrice)}</b>
                                        </div>
                                        <div className="option-list">
                                            {service.options.map((option) => {
                                                const value = values[option.id];
                                                const enabled =
                                                    option.kind === "toggle"
                                                        ? Boolean(value)
                                                        : Number(value ?? option.defaultQuantity ?? 1) > 0;
                                                const amount =
                                                    option.kind === "toggle"
                                                        ? value === true
                                                            ? option.price
                                                            : 0
                                                        : Number(value ?? option.defaultQuantity ?? 1) *
                                                        option.unitPrice;
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
                                                            <div
                                                                className="option-control counter-control">
                                                                <button
                                                                    type="button"
                                                                    aria-label={`Decrease ${option.name}`}
                                                                    onClick={() =>
                                                                        changeOption(
                                                                            service.id,
                                                                            option.id,
                                                                            Math.max(
                                                                                option.min,
                                                                                Number(
                                                                                    value ?? option.defaultQuantity ?? 1,
                                                                                ) - 1,
                                                                            ),
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        Number(
                                                                            value ?? option.defaultQuantity ?? 1,
                                                                        ) <= option.min
                                                                    }
                                                                >
                                                                    −
                                                                </button>
                                                                <span
                                                                    className="counter-value num"
                                                                    aria-live="polite"
                                                                >
                                  {Number(value ?? option.defaultQuantity ?? 1)}
                                </span>
                                                                <button
                                                                    type="button"
                                                                    aria-label={`Increase ${option.name}`}
                                                                    onClick={() =>
                                                                        changeOption(
                                                                            service.id,
                                                                            option.id,
                                                                            Math.min(
                                                                                option.max,
                                                                                Number(
                                                                                    value ?? option.defaultQuantity ?? 1,
                                                                                ) + 1,
                                                                            ),
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        Number(
                                                                            value ?? option.defaultQuantity ?? 1,
                                                                        ) >= option.max
                                                                    }
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className={`switch${enabled ? " on" : ""}`}
                                                                role="switch"
                                                                aria-checked={value === true}
                                                                aria-label={option.name}
                                                                onClick={() =>
                                                                    changeOption(
                                                                        service.id,
                                                                        option.id,
                                                                        value !== true,
                                                                    )
                                                                }
                                                            >
                                                                <span/>
                                                            </button>
                                                        )}
                                                        <strong className="option-amount num">
                                                            {formatINR(amount)}
                                                        </strong>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <StepHeading
                                eyebrow="03 / Add-ons & billing"
                                title="The finishing touches"
                                description="A few thoughtful extras can make the whole project work harder. Add any that feel right."
                            />
                            <SectionEyebrow>Recommended for your scope</SectionEyebrow>
                            <div className="addon-list">
                                {ADD_ONS.filter(
                                    (addOn) =>
                                        chosenAddOns.includes(addOn.id) ||
                                        addOn.triggers.some((id) => selected.includes(id)),
                                ).map((addOn) => {
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
                                                <strong className="num">
                                                    {formatINR(addOn.price)}
                                                </strong>
                                                {addOn.suffix && <small>{addOn.suffix}</small>}
                                            </div>
                                            <button
                                                type="button"
                                                className={
                                                    isChosen
                                                        ? "button button-quiet addon-action"
                                                        : "button button-outline addon-action"
                                                }
                                                onClick={() => toggleAddOn(addOn.id)}
                                                aria-pressed={isChosen}
                                            >
                                                {isChosen ? "Remove" : "Add"}
                                            </button>
                                        </article>
                                    );
                                })}
                                {ADD_ONS.every(
                                    (addOn) =>
                                        !chosenAddOns.includes(addOn.id) &&
                                        !addOn.triggers.some((id) => selected.includes(id)),
                                ) && (
                                    <p className="empty-note">
                                        Your selected services do not have suggested extras. You can
                                        continue to your quotation.
                                    </p>
                                )}
                            </div>

                            <div className="billing-section">
                                <SectionEyebrow>
                                    Billing details{" "}
                                    <span className="optional-label">Optional</span>
                                </SectionEyebrow>
                                <div className="form-grid">
                                    {(
                                        [
                                            [
                                                "company",
                                                "Company name",
                                                "e.g. Northstar Studio",
                                                "text",
                                            ],
                                            ["name", "Contact person", "Full name", "text"],
                                            ["email", "Email address", "name@company.com", "email"],
                                            ["phone", "Phone number", "+91 98765 43210", "tel"],
                                            ["gstin", "GSTIN", "Optional", "text"],
                                            [
                                                "state",
                                                "Place of supply / state",
                                                "e.g. Karnataka",
                                                "text",
                                            ],
                                        ] as const
                                    ).map(([field, label, placeholder, type]) => (
                                        <label className="field" key={field}>
                                            {label}
                                            <input
                                                type={type}
                                                value={client[field]}
                                                placeholder={placeholder}
                                                onChange={(event) =>
                                                    setClient((current) => ({
                                                        ...current,
                                                        [field]: event.target.value,
                                                    }))
                                                }
                                                autoComplete={
                                                    field === "name"
                                                        ? "name"
                                                        : field === "company"
                                                            ? "organization"
                                                            : field === "email"
                                                                ? "email"
                                                                : field === "phone"
                                                                    ? "tel"
                                                                    : "off"
                                                }
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {step === 4 && (
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
                                    <strong>
                                        {quoteDate?.toLocaleDateString("en-IN") ?? "—"}
                                    </strong>
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
                                    <p>
                                        {[
                                                client.company.trim() && client.name.trim()
                                                    ? client.name.trim()
                                                    : "",
                                                client.email.trim(),
                                                client.phone.trim(),
                                                client.gstin.trim() ? `GSTIN ${client.gstin.trim()}` : "",
                                                client.state.trim()
                                                    ? `Place of supply: ${client.state.trim()}`
                                                    : "",
                                            ]
                                                .filter(Boolean)
                                                .join(" · ") ||
                                            "Client details can be added in the previous step."}
                                    </p>
                                </div>
                            </div>
                            <div className="review-groups">
                                {quote.groups.map((group) => (
                                    <section className="review-group" key={group.id}>
                                        <div className="review-group-heading">
                                            <strong>{group.name}</strong>
                                            <b className="num">{formatINR(group.total)}</b>
                                        </div>
                                        {group.lines.map((line, index) => (
                                            <div className="review-line"
                                                 key={`${group.id}-${index}`}>
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
                                    50% advance to start, 25% at design sign-off, 25% before
                                    handover. Prices in INR, GST charged at 18% as applicable,
                                    third-party licences billed at actuals.
                                </p>
                                <small>
                                    Timelines confirmed after the kick-off call and content
                                    handover.
                                </small>
                            </div>
                            <button
                                type="button"
                                className="button button-primary download-review"
                                onClick={() => void downloadPdf()}
                                disabled={!selected.length || isDownloading}
                            >
                                <span aria-hidden="true">↓</span>
                                {isDownloading
                                    ? "Preparing your PDF…"
                                    : "Download quotation PDF"}
                            </button>
                            {downloadError && (
                                <p className="error-message" role="alert">
                                    {downloadError}
                                </p>
                            )}
                        </>
                    )}

                    <div className="workflow-footer">
                        <button
                            type="button"
                            className="button button-quiet"
                            onClick={() => goToStep(step - 1)}
                            disabled={step === 1}
                        >
                            ← <span>Back</span>
                        </button>
                        <span className="footer-step num">
              {String(step).padStart(2, "0")} <span>/ 04</span>
            </span>
                        <button
                            type="button"
                            className="button button-primary"
                            onClick={() => goToStep(step + 1)}
                            disabled={step === 4 || (step === 1 && selected.length === 0)}
                        >
                            {step === 3 ? "Review quotation" : "Continue"}
                            <span aria-hidden="true">→</span>
                        </button>
                    </div>
                </section>

                <aside className="ledger glass" aria-label="Live quotation summary">
                    <div className="ledger-header">
                        <div>
                            <SectionEyebrow>Live estimate</SectionEyebrow>
                            <h2>Your ledger</h2>
                        </div>
                        <span className="updating">
              <span className="status-dot"/> Updating
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
                        onClick={() => void downloadPdf()}
                        disabled={!selected.length || isDownloading}
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
            </main>
            <footer className="page-footer">
                <span>Thoughtful work, clearly scoped.</span>
                <span>All prices in INR · GST 18% as applicable</span>
            </footer>
        </div>
    );
}
