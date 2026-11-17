export interface QuoteFormData {
  origin: string;
  destination: string;
  service: string;
  km: number;
}

export interface QuoteFormDetailData {
  name: string;
  email: string;
  phone: string;
  weight: number;
  volume: number;
}

export interface QuoteResult extends QuoteFormData, QuoteFormDetailData {
  baseRate: number;
  costDistance: number;
  costWeight: number;
  costVolume: number;
  total: number;
}
