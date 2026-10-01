import { Service } from "@/types/quote-catalog.types";
import { readOptionValue } from "@/lib/quote-calculation";

export function getServiceDefaults(
  service: Service,
): Record<string, number | boolean> {
  return Object.fromEntries(
    service.options.map((option) => [
      option.id,
      readOptionValue(undefined, option),
    ]),
  );
}
