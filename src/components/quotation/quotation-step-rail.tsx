import { STEPS } from "@/constants/app.constants";
import { SectionEyebrow } from "./section-eyebrow";

export function QuotationStepRail({
  step,
  selectedCount,
  onGoToStep,
}: {
  step: number;
  selectedCount: number;
  onGoToStep: (nextStep: number) => void;
}) {
  return (
    <nav className="step-rail glass" aria-label="Quotation steps">
      <SectionEyebrow>Workspace</SectionEyebrow>
      <ol>
        {STEPS.map((item, index) => {
          const stepNumber = index + 1;
          const reachable = selectedCount > 0 || stepNumber === 1;
          return (
            <li key={item.title}>
              <button
                className={`step-link${step === stepNumber ? " is-active" : ""}${step > stepNumber ? " is-complete" : ""}`}
                type="button"
                onClick={() => onGoToStep(stepNumber)}
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
  );
}
