import { Component, inject, signal } from '@angular/core';
import { SectionHeadingComponent } from '@shared/components/section-heading-component/section-heading-component';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { MessageSuccessComponent } from '@shared/components/message-success-component/message-success-component';
import { FormQuoteComponent } from '@features/email/components/form-quote-component/form-quote-component';
import { QuoteFormData, QuoteResult } from '@features/email/models/email-model';
import { PreviewQuoteComponent } from '@features/email/components/preview-quote-component/preview-quote-component';
import { EmailService } from '@features/email/services/email-service';
import { LoggerService } from '@core/services/logger-service';
import { firstValueFrom } from 'rxjs';
import { QUOTE_PRICING_RULES as pricing } from '@shared/constants/quote-pricing';

@Component({
  imports: [SectionHeadingComponent, FormQuoteComponent, PreviewQuoteComponent, RevealDirective, MessageSuccessComponent],
  selector: 'app-quote-page',
  templateUrl: './quote-page.html',
})
export class QuotePage {
  protected readonly quoteResult = signal<QuoteResult | null>(null);
  protected readonly message = signal<string | null>(null);
  protected readonly isLoading = signal<boolean>(false);
  protected readonly resetTrigger = signal<number>(0);
  private readonly emailService = inject(EmailService);
  private readonly loggerService = inject(LoggerService);

  protected calculate(data: QuoteFormData): void {
    this.message.set(null);

    // Km requerido; sin estimado por largos de texto.
    const km = data.km;
    const costDistance = Math.round(km * pricing.pricePerKm);
    const costWeight = data.weight > pricing.includedWeightKg
      ? Math.ceil((data.weight - pricing.includedWeightKg) / pricing.weightBlockKg) * pricing.blockSurcharge
      : 0;
    const costVolume = data.volume > pricing.includedVolumeM3
      ? Math.ceil((data.volume - pricing.includedVolumeM3) / pricing.volumeBlockM3) * pricing.blockSurcharge
      : 0;
    const total = pricing.baseRate + costDistance + costWeight + costVolume;

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
      baseRate: pricing.baseRate,
      costDistance,
      costWeight,
      costVolume,
      total,
    });

    // Scroll suave al resultado (solo en el navegador; calculate() ocurre tras submit).
    if (typeof document !== 'undefined') {
      document.getElementById('quote-result')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  protected recalculate(): void {
    this.quoteResult.set(null);
  }

  protected async submit(): Promise<void> {
    if (this.isLoading()) {
      return;
    }

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
