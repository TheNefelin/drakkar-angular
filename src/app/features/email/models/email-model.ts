export interface ContactFormData {
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
}

export interface QuoteFormData {
  origen: string;
  destino: string;
  servicio: string;
  peso: number;
  volumen: number;
  km: number;
}

export interface QuoteResult {
  km: number;
  costoKm: number;
  costoPeso: number;
  costoVolumen: number;
  total: number;
}
