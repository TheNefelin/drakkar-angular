import { Component, signal } from '@angular/core';
import { SectionHeadingComponent } from '@shared/components/section-heading-component/section-heading-component';
import { FormQuoteComponent } from '@features/email/components/form-quote-component/form-quote-component';
import { QuoteFormData, QuoteResult } from '@features/email/models/email-model';

@Component({
  imports: [SectionHeadingComponent, FormQuoteComponent],
  selector: 'app-quote-page',
  templateUrl: './quote-page.html',
})
export class QuotePage {
  protected readonly result = signal<QuoteResult | null>(null);

  protected calculate(data: QuoteFormData): void {
    const base = 15000;
    const tarifaKm = 800;
    const tarifaKg = 5;
    const tarifaM3 = 5000;

    const km = data.km || Math.max(1, data.origen.length + data.destino.length);
    const costoKm = Math.round(km * tarifaKm);
    const costoPeso = Math.round(data.peso * tarifaKg);
    const costoVolumen = Math.round(data.volumen * tarifaM3);
    const total = base + costoKm + costoPeso + costoVolumen;

    this.result.set({ km, costoKm, costoPeso, costoVolumen, total });
  }
}
