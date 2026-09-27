export function WorkflowFooter({
  step,
  selectedCount,
  onGoToStep,
}: {
  step: number;
  selectedCount: number;
  onGoToStep: (nextStep: number) => void;
}) {
  return (
    <div className="workflow-footer">
      <button
        type="button"
        className="button button-quiet"
        onClick={() => onGoToStep(step - 1)}
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
        onClick={() => onGoToStep(step + 1)}
        disabled={step === 4 || (step === 1 && selectedCount === 0)}
      >
        {step === 3 ? "Review quotation" : "Continue"}
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
