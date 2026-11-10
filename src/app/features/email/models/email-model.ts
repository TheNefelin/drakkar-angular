export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface QuoteFormData {
  origin: string;
  destination: string;
  service: string;
  weight: number;
  volume: number;
  km: number;
}

export interface QuoteResult {
  km: number;
  distanceCost: number;
  weightCost: number;
  volumeCost: number;
  total: number;
}
