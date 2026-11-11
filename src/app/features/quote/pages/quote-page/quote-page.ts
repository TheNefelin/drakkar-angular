import { Component, signal } from '@angular/core';
import { SectionHeadingComponent } from '@shared/components/section-heading-component/section-heading-component';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { FormQuoteComponent } from '@features/email/components/form-quote-component/form-quote-component';
import { QuoteFormData, QuoteResult } from '@features/email/models/email-model';
import { PrevieweQuoteComponent } from '@features/email/components/previewe-quote-component/previewe-quote-component';

@Component({
  imports: [SectionHeadingComponent, FormQuoteComponent, PrevieweQuoteComponent, RevealDirective],
  selector: 'app-quote-page',
  templateUrl: './quote-page.html',
})
export class QuotePage {
  protected readonly quoteResult = signal<QuoteResult | null>(null);
  protected readonly baseRate = 1500;

  protected calculate(data: QuoteFormData): void {
    const tarifaKm = 100;
    const tarifaKg = 50;
    const tarifaM3 = 500;

    const km = data.km || Math.max(1, data.origin.length + data.destination.length);
    const costDistance = Math.round(km * tarifaKm);
    const costWeight = Math.round(data.weight * tarifaKg);
    const costVolume = Math.round(data.volume * tarifaM3);
    const total = this.baseRate + costDistance + costWeight + costVolume;

    this.quoteResult.set({ 
      name: data.name,
      email: data.email,
      phone: data.phone,
      origin: data.origin,
      destination: data.destination,
      km,
      service: data.service,
      weight: data.weight,
      volume: data.volume,
      baseRate: this.baseRate,
      costDistance, 
      costWeight, 
      costVolume, 
      total 
    });
  }

  protected recalculate(): void {
    this.quoteResult.set(null);
  }

  protected submit(): void {
    console.log(this.quoteResult());
  }
}
