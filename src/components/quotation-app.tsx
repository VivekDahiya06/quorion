"use client";

import { useState } from "react";
import { calculateQuote } from "@/lib/quote-calculation";
import { StepAddOns } from "./quotation/steps/step-addons";
import { StepReview } from "./quotation/steps/step-review";
import { WorkflowFooter } from "./quotation/workflow-footer";
import { getServiceDefaults } from "@/lib/quotation-catalog";
import { StepServices } from "./quotation/steps/step-services";
import { QuotationTopbar } from "./quotation/quotation-topbar";
import { QuotationLedger } from "./quotation/quotation-ledger";
import { STEPS } from "@/constants/app.constants";
import { SERVICES } from "@/constants/quotation-catalog.constants";
import type { QuoteConfig } from "@/types/quote-calculation.types";
import { QuotationStepRail } from "./quotation/quotation-step-rail";
import { useQuotationIdentity } from "@/hooks/use-quotation-identity";
import { StepConfiguration } from "./quotation/steps/step-configuration";
import { type ClientDetails, downloadQuotationPdf } from "@/lib/quotation-pdf";

const EMPTY_CLIENT: ClientDetails = {
  name: "",
  company: "",
  email: "",
  phone: "",
  gstin: "",
  state: "",
};

export default function QuotationApp() {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [config, setConfig] = useState<QuoteConfig>({});
  const [activeService, setActiveService] = useState<string | null>(null);
  const [chosenAddOns, setChosenAddOns] = useState<string[]>([]);
  const [client, setClient] = useState<ClientDetails>(EMPTY_CLIENT);
  const { reference, date: quoteDate } = useQuotationIdentity();
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

  const changeClient = (field: keyof ClientDetails, value: string) => {
    setClient((current) => ({ ...current, [field]: value }));
  };

  const downloadPdf = async () => {
    if (!quote.groups.length || !quoteDate || !reference) return;
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

  // Selected services that have no priced feature yet.
  const unconfiguredServices = selected.filter(
    (serviceId) => !quote.groups.some((group) => group.id === serviceId),
  );

  // Whether a step's requirements are met by the current state.
  const isStepComplete = (stepNumber: number) => {
    if (stepNumber === 1) return selected.length > 0;
    if (stepNumber === 2)
      return selected.length > 0 && unconfiguredServices.length === 0;
    if (stepNumber === 3) return true;
    return false;
  };

  // A step counts as done once it was passed with Continue and is still
  // complete. Done steps form an unbroken chain from step 1, so editing an
  // earlier step re-locks every step after it.
  const doneSteps: number[] = [];
  for (let stepNumber = 1; stepNumber <= STEPS.length; stepNumber += 1) {
    if (!completedSteps.includes(stepNumber) || !isStepComplete(stepNumber))
      break;
    doneSteps.push(stepNumber);
  }
  const maxReachableStep = Math.min(STEPS.length, doneSteps.length + 1);

  const goToStep = (nextStep: number) => {
    if (nextStep < 1 || nextStep > STEPS.length || nextStep === step) return;

    const isAdvancing = nextStep === step + 1;
    if (isAdvancing && step <= maxReachableStep && isStepComplete(step)) {
      setCompletedSteps((current) =>
        current.includes(step) ? current : [...current, step],
      );
      setStep(nextStep);
      return;
    }

    if (nextStep <= maxReachableStep) setStep(nextStep);
  };

  return (
    <div className="app-shell">
      <div className="aurora-bg" aria-hidden="true" />
      <QuotationTopbar client={client} reference={reference} />

      <main className="main-grid">
        <QuotationStepRail
          step={step}
          completedSteps={doneSteps}
          maxReachableStep={maxReachableStep}
          onGoToStep={goToStep}
        />

        <section className="workflow glass" aria-live="polite">
          {step === 1 && (
            <StepServices selected={selected} onToggleService={toggleService} />
          )}

          {step === 2 && (
            <StepConfiguration
              selected={selected}
              config={config}
              activeService={activeService}
              unconfiguredServices={unconfiguredServices}
              onSelectService={setActiveService}
              onChangeOption={changeOption}
            />
          )}

          {step === 3 && (
            <StepAddOns
              selected={selected}
              chosenAddOns={chosenAddOns}
              client={client}
              onToggleAddOn={toggleAddOn}
              onChangeClient={changeClient}
            />
          )}

          {step === 4 && (
            <StepReview
              quote={quote}
              client={client}
              reference={reference}
              quoteDate={quoteDate}
              isDownloading={isDownloading}
              downloadError={downloadError}
              onDownload={() => void downloadPdf()}
            />
          )}

          <WorkflowFooter
            step={step}
            canContinue={isStepComplete(step)}
            onGoToStep={goToStep}
          />
        </section>

        <QuotationLedger
          quote={quote}
          hasSelection={selected.length > 0}
          isDownloading={isDownloading}
          downloadError={downloadError}
          onDownload={() => void downloadPdf()}
        />
      </main>
      <footer className="page-footer">
        <span>Thoughtful work, clearly scoped.</span>
        <span>All prices in INR · GST 18% as applicable</span>
      </footer>
    </div>
  );
}
