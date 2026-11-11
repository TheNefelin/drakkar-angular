// Reglas de cotización compartida (cliente y BFF).
export interface QuotePricingRules {
  /** Tarifa base, siempre incluida en el total. */
  readonly baseRate: number;
  /** Precio por cada km. */
  readonly pricePerKm: number;
  /** Kilogramos incluidos en la tarifa base. */
  readonly includedWeightKg: number;
  /** Bloque de kg sobre el incluido, con recargo propio. */
  readonly weightBlockKg: number;
  /** m³ incluidos en la tarifa base. */
  readonly includedVolumeM3: number;
  /** Bloque de m³ sobre el incluido, con recargo propio. */
  readonly volumeBlockM3: number;
  /** $ por bloque (peso o volumen) sobre el incluido. */
  readonly blockSurcharge: number;
}

// Valores vigentes del cotizador referencial.
export const QUOTE_PRICING_RULES: QuotePricingRules = {
  baseRate: 10000,
  pricePerKm: 2000,
  includedWeightKg: 1200,
  weightBlockKg: 500,
  includedVolumeM3: 3,
  volumeBlockM3: 1,
  blockSurcharge: 10000,
};
