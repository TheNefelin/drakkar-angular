import { Component, signal } from '@angular/core';
import { SectionHeadingComponent } from '@shared/components/section-heading-component/section-heading-component';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { FormQuoteComponent } from '@features/email/components/form-quote-component/form-quote-component';
import { QuoteFormData, QuoteResult } from '@features/email/models/email-model';

@Component({
  imports: [SectionHeadingComponent, FormQuoteComponent, RevealDirective],
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

    const km = data.km || Math.max(1, data.origin.length + data.destination.length);
    const distanceCost = Math.round(km * tarifaKm);
    const weightCost = Math.round(data.weight * tarifaKg);
    const volumeCost = Math.round(data.volume * tarifaM3);
    const total = base + distanceCost + weightCost + volumeCost;

    this.result.set({ km, distanceCost, weightCost, volumeCost, total });
  }
}
