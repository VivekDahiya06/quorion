import { SectionEyebrow } from "./section-eyebrow";

export function StepHeading({
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
