import { Component, output, signal } from '@angular/core';
import { QuoteFormData } from '@features/email/models/email-model';

export interface QuoteFormErrors {
  origin?: string;
  destination?: string;
  service?: string;
  weight?: string;
  volume?: string;
  km?: string;
}

@Component({
  imports: [],
  selector: 'app-form-quote-component',
  templateUrl: './form-quote-component.html',
})
export class FormQuoteComponent {
  readonly formSubmit = output<QuoteFormData>();

  protected readonly errors = signal<QuoteFormErrors>({});

  protected onSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const data = new FormData(form);

    const payload: QuoteFormData = {
      origin: String(data.get('origin') ?? '').trim(),
      destination: String(data.get('destination') ?? '').trim(),
      service: String(data.get('service') ?? '').trim(),
      weight: Number(data.get('weight') ?? 0),
      volume: Number(data.get('volume') ?? 0),
      km: Number(data.get('km') ?? 0),
    };

    const errors = this.validate(payload);
    if (Object.keys(errors).length) {
      this.errors.set(errors);
      return;
    }

    this.errors.set({});
    this.formSubmit.emit(payload);
  }

  private validate(data: QuoteFormData): QuoteFormErrors {
    const errors: QuoteFormErrors = {};

    if (!data.origin) {
      errors.origin = 'El origin es obligatorio.';
    }

    if (!data.destination) {
      errors.destination = 'El destination es obligatorio.';
    }

    if (!data.service) {
      errors.service = 'El service es obligatorio.';
    }

    if (data.weight < 0) {
      errors.weight = 'Ingresa un weight válido (0 o más).';
    }

    if (data.volume < 0) {
      errors.volume = 'Ingresa un volume válido (0 o más).';
    }

    if (data.km < 0) {
      errors.km = 'Ingresa kilómetros válidos (0 o más).';
    }

    return errors;
  }
}
