import { STEPS } from "@/constants/app.constants";
import { SectionEyebrow } from "./section-eyebrow";

export function QuotationStepRail({
  step,
  completedSteps,
  maxReachableStep,
  onGoToStep,
}: {
  step: number;
  completedSteps: number[];
  maxReachableStep: number;
  onGoToStep: (nextStep: number) => void;
}) {
  return (
    <nav className="step-rail glass" aria-label="Quotation steps">
      <SectionEyebrow>Workspace</SectionEyebrow>
      <ol>
        {STEPS.map((item, index) => {
          const stepNumber = index + 1;
          const reachable =
            stepNumber <= maxReachableStep || stepNumber === step;
          const isComplete = completedSteps.includes(stepNumber);
          return (
            <li key={item.title}>
              <button
                className={`step-link${step === stepNumber ? " is-active" : ""}${isComplete ? " is-complete" : ""}`}
                type="button"
                onClick={() => onGoToStep(stepNumber)}
                disabled={!reachable}
                aria-current={step === stepNumber ? "step" : undefined}
              >
                <span className="step-number num">
                  {isComplete ? "✓" : `0${stepNumber}`}
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
