"use client";

export default function Error({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="app-shell error-screen">
      <div className="aurora-bg" aria-hidden="true" />
      <div className="glass error-card">
        <span className="brand-mark" aria-hidden="true">
          Q
        </span>
        <p className="eyebrow">Something went wrong</p>
        <h1>Let’s try that again.</h1>
        <p>
          The quotation desk hit an unexpected issue. Try again to return to the
          quotation desk, or reload the page if the problem persists.
        </p>
        <button
          className="button button-primary"
          type="button"
          onClick={() => retry()}
        >
          Try again <span aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  );
}
