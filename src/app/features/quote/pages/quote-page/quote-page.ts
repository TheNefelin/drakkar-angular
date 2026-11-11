import { Component, inject, signal } from '@angular/core';
import { SectionHeadingComponent } from '@shared/components/section-heading-component/section-heading-component';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { MessageSuccessComponent } from '@shared/components/message-success-component/message-success-component';
import { FormQuoteComponent } from '@features/email/components/form-quote-component/form-quote-component';
import { QuoteFormData, QuoteResult } from '@features/email/models/email-model';
import { PrevieweQuoteComponent } from '@features/email/components/previewe-quote-component/previewe-quote-component';
import { EmailService } from '@features/email/services/email-service';
import { LoggerService } from '@core/services/logger-service';
import { firstValueFrom } from 'rxjs';

@Component({
  imports: [SectionHeadingComponent, FormQuoteComponent, PrevieweQuoteComponent, RevealDirective, MessageSuccessComponent],
  selector: 'app-quote-page',
  templateUrl: './quote-page.html',
})
export class QuotePage {
  protected readonly quoteResult = signal<QuoteResult | null>(null);
  protected readonly baseRate = 1500;
  protected readonly message = signal<string | null>(null);
  protected readonly isLoading = signal<boolean>(false);
  protected readonly resetTrigger = signal<number>(0);
  private readonly emailService = inject(EmailService);
  private readonly loggerService = inject(LoggerService);

  protected calculate(data: QuoteFormData): void {
    const tarifaKm = 100;
    const tarifaKg = 50;
    const tarifaM3 = 500;

    this.message.set(null);

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

  protected async submit(): Promise<void> {
    const result = this.quoteResult();

    if (!result) {
      return;
    }

    this.isLoading.set(true);
    this.message.set(null);

    try {
      await firstValueFrom(this.emailService.emailQuote(result));
      this.message.set('Cotización enviada correctamente.');
      this.quoteResult.set(null);
      this.resetTrigger.set(Date.now());
    } catch (error: unknown) {
      this.loggerService.error('QuotePage', 'submit', error);
      this.message.set('No se pudo enviar la cotización.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
