export interface ContactFormBase {
  name: string;
  email: string;
  phone: string;
}

export interface ContactFormData extends ContactFormBase {
  message: string;
}

export interface QuoteFormData extends ContactFormBase {
  origin: string;
  destination: string;
  service: string;
  weight: number;
  volume: number;
  km: number;
}

export interface QuoteResult extends QuoteFormData {
  baseRate: number;
  costDistance: number;
  costWeight: number;
  costVolume: number;
  total: number;
}
