export const PRICING = {
  formation: {
    newMexico: {
      price: 739,
      currency: "EUR",
      state: "New Mexico",
      processingDays: "2-3",
    },
    wyoming: {
      price: 899,
      currency: "EUR",
      state: "Wyoming",
      processingDays: "2-3",
    },
    delaware: {
      price: 1399,
      currency: "EUR",
      state: "Delaware",
      processingDays: "3-5",
    },
  },
  maintenance: {
    newMexico: {
      price: 539,
      currency: "EUR",
      state: "New Mexico",
    },
    wyoming: {
      price: 699,
      currency: "EUR",
      state: "Wyoming",
    },
    delaware: {
      price: 999,
      currency: "EUR",
      state: "Delaware",
    },
  },
  additionalServices: {
    consultation: {
      price: 120,
      currency: "EUR",
      duration: 30,
    },
    dissolution: {
      price: 350,
      currency: "EUR",
    },
  },
} as const;

export type FormationState = keyof typeof PRICING.formation;
export type MaintenanceState = keyof typeof PRICING.maintenance;
export type AdditionalService = keyof typeof PRICING.additionalServices;

export function formatPrice(price: number, currency: string = "EUR"): string {
  if (currency === "EUR") {
    return `${price.toLocaleString("es-ES")}€`;
  }
  return `$${price.toLocaleString("en-US")}`;
}

export function getFormationPrice(state: FormationState): number {
  return PRICING.formation[state].price;
}

export function getMaintenancePrice(state: MaintenanceState): number {
  return PRICING.maintenance[state].price;
}

export function getFormationPriceFormatted(state: FormationState): string {
  const { price, currency } = PRICING.formation[state];
  return formatPrice(price, currency);
}

export function getMaintenancePriceFormatted(state: MaintenanceState): string {
  const { price, currency } = PRICING.maintenance[state];
  return formatPrice(price, currency);
}

export function getAdditionalServicePrice(service: AdditionalService): number {
  return PRICING.additionalServices[service].price;
}

export function getAdditionalServicePriceFormatted(service: AdditionalService): string {
  const { price, currency } = PRICING.additionalServices[service];
  return formatPrice(price, currency);
}
