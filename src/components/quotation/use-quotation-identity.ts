"use client";

import { useSyncExternalStore } from "react";
import { createQuotationReference } from "@/lib/quote-calculation";

type QuotationIdentity = { reference: string; date: Date | null };

const SERVER_IDENTITY: QuotationIdentity = { reference: "", date: null };
let browserIdentity: QuotationIdentity | undefined;

function subscribeToIdentity() {
  return () => {};
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

export function useQuotationIdentity() {
  return useSyncExternalStore(
    subscribeToIdentity,
    getBrowserIdentity,
    getServerIdentity,
  );
}
