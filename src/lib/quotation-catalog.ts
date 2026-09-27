import { Service } from "@/types/quote-catalog.types";

export function getServiceDefaults(
  service: Service,
): Record<string, number | boolean> {
  return Object.fromEntries(
    service.options.map((option) => {
      if (option.kind === "toggle") {
        return [option.id, option.defaultOn ?? false];
      }
      const quantity = Math.trunc(option.defaultQuantity ?? 1);
      return [option.id, Math.min(option.max, Math.max(option.min, quantity))];
    }),
  );
}
