import Link from "next/link";

export default function NotFound() {
  return (
    <main className="app-shell error-screen">
      <div className="aurora-bg" aria-hidden="true" />
      <div className="glass error-card">
        <span className="brand-mark" aria-hidden="true">
          Q
        </span>
        <p className="eyebrow">404 / Not found</p>
        <h1>This page is out of scope.</h1>
        <p>
          The page you were looking for doesn’t exist. Let’s get you back to the
          quotation desk.
        </p>
        <Link className="button button-primary" href="/">
          Back to Quorion <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
