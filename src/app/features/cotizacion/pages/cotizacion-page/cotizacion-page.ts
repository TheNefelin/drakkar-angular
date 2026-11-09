import { Component, signal } from '@angular/core';

interface CotizacionResult {
  km: number;
  costoKm: number;
  costoPeso: number;
  costoVolumen: number;
  total: number;
}

@Component({
  imports: [],
  selector: 'app-cotizacion-page',
  templateUrl: './cotizacion-page.html',
})
export class CotizacionPage {
  protected readonly result = signal<CotizacionResult | null>(null);

  protected calculate(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const data = new FormData(form);
    const origen = String(data.get('origen') ?? '');
    const destino = String(data.get('destino') ?? '');
    const servicio = String(data.get('servicio') ?? '');
    const peso = Number(data.get('peso') ?? 0);
    const volumen = Number(data.get('volumen') ?? 0);
    const kmEstimados = Number(data.get('km') ?? 0);

    const base = 15000;
    const tarifaKm = 800;
    const tarifaKg = 5;
    const tarifaM3 = 5000;

    const km = kmEstimados || Math.max(1, origen.length + destino.length);
    const costoKm = Math.round(km * tarifaKm);
    const costoPeso = Math.round(peso * tarifaKg);
    const costoVolumen = Math.round(volumen * tarifaM3);
    const total = base + costoKm + costoPeso + costoVolumen;

    this.result.set({ km, costoKm, costoPeso, costoVolumen, total });
  }
}