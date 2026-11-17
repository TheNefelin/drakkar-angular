import { Component, inject, signal } from '@angular/core';
import { SectionHeadingComponent } from '@shared/components/section-heading-component/section-heading-component';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { MessageSuccessComponent } from '@shared/components/message-success-component/message-success-component';
import { EmailService } from '@features/email/services/email-service';
import { LoggerService } from '@core/services/logger-service';
import { firstValueFrom } from 'rxjs';
import { QUOTE_PRICING_RULES } from '@shared/constants/quote-pricing';
import { QuoteFormBaseComponent } from '@features/quote/components/quote-form-base-component/quote-form-base-component';
import { QuoteFormDetailComponent } from '@features/quote/components/quote-form-detail-component/quote-form-detail-component';
import { QuoteFormData, QuoteFormDetailData, QuoteResult } from '@features/quote/models/quote-model';
import { QuotePreviewComponent } from '@features/quote/components/quote-preview-component/quote-preview-component';

@Component({
  imports: [SectionHeadingComponent, RevealDirective, MessageSuccessComponent, QuoteFormBaseComponent, QuoteFormDetailComponent, QuotePreviewComponent],
  selector: 'app-quote-page',
  templateUrl: './quote-page.html',
})
export class QuotePage {
  // SERVICES ---------------------------------------------------------------
  private readonly emailService = inject(EmailService);
  private readonly loggerService = inject(LoggerService);

  // STATES -----------------------------------------------------------------
  protected readonly successMessage = signal<string | null>(null);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly resetTrigger = signal<number>(0);
  protected readonly quoteResult = signal<QuoteResult | null>(null);
  protected readonly isEstimating = signal<boolean>(true);

  // EVENTS -----------------------------------------------------------------
  protected calculateBase(data: QuoteFormData): void {
    this.successMessage.set(null);

    const km = data.km;
    const details: QuoteFormDetailData = {
      weight: this.quoteResult()?.weight ?? 0,
      volume: this.quoteResult()?.volume ?? 0,
      name: this.quoteResult()?.name ?? '',
      email: this.quoteResult()?.email ?? '',
      phone: this.quoteResult()?.phone ?? '',
    };

    this.quoteResult.set(this.buildQuoteResult(data, details));
    this.isEstimating.set(false);
    this.scrollToResult();
  }

  protected previewDetail(data: QuoteFormDetailData): void {
    this.successMessage.set(null);

    const base: QuoteFormData = {
      km: this.quoteResult()?.km ?? 0,
      origin: this.quoteResult()?.origin ?? '',
      destination: this.quoteResult()?.destination ?? '',
      service: this.quoteResult()?.service ?? '',
    };

    if (!base.km) {
      return;
    }

    this.quoteResult.set(this.buildQuoteResult(base, data));
  }

  protected recalculate(): void {
    this.successMessage.set(null);
    this.isEstimating.set(true);
    this.scrollToResult();
  }

  // Envío con el desglose completo calculado en vivo desde el detalle.
  protected async submit(details: QuoteFormDetailData): Promise<void> {
    if (this.isSaving()) {
      return;
    }

    const base: QuoteFormData = {
      km: this.quoteResult()?.km ?? 0,
      origin: this.quoteResult()?.origin ?? '',
      destination: this.quoteResult()?.destination ?? '',
      service: this.quoteResult()?.service ?? '',
    };

    if (!base.km) {
      return;
    }

    const result = this.buildQuoteResult(base, details);

    this.isSaving.set(true);
    this.successMessage.set(null);

    try {
      await firstValueFrom(this.emailService.emailQuote(result));
      this.successMessage.set('Cotización enviada correctamente.');
      this.quoteResult.set(null);
      this.resetTrigger.set(Date.now());
    } catch (error: unknown) {
      this.loggerService.error('QuotePage', 'submit', error);
      this.successMessage.set('No se pudo enviar la cotización.');
    } finally {
      this.isSaving.set(false);
    }
  }

  private buildQuoteResult(base: QuoteFormData, details: QuoteFormDetailData): QuoteResult {
    const distanceCost = Math.round(base.km * QUOTE_PRICING_RULES.pricePerKm);
    const weightCost = details.weight > QUOTE_PRICING_RULES.includedWeightKg
      ? Math.ceil((details.weight - QUOTE_PRICING_RULES.includedWeightKg) / QUOTE_PRICING_RULES.weightBlockKg) * QUOTE_PRICING_RULES.blockSurcharge
      : 0;
    const volumeCost = details.volume > QUOTE_PRICING_RULES.includedVolumeM3
      ? Math.ceil((details.volume - QUOTE_PRICING_RULES.includedVolumeM3) / QUOTE_PRICING_RULES.volumeBlockM3) * QUOTE_PRICING_RULES.blockSurcharge
      : 0;
    const total = QUOTE_PRICING_RULES.baseRate + distanceCost + weightCost + volumeCost;

    return {
      origin: base.origin,
      destination: base.destination,
      service: base.service,
      km: base.km,
      name: details.name,
      email: details.email,
      phone: details.phone,
      weight: details.weight,
      volume: details.volume,
      baseRate: QUOTE_PRICING_RULES.baseRate,
      costDistance: distanceCost,
      costWeight: weightCost,
      costVolume: volumeCost,
      total,
    };
  }

  private scrollToResult(): void {
    if (typeof document !== 'undefined') {
      document.getElementById('quote-result')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
}
