import { Component, output, signal } from '@angular/core';
import { QuoteFormData } from '@features/email/models/email-model';

export interface CotizacionFormErrors {
  origen?: string;
  destino?: string;
  servicio?: string;
  peso?: string;
  volumen?: string;
  km?: string;
}

@Component({
  imports: [],
  selector: 'app-form-quote-component',
  templateUrl: './form-quote-component.html',
})
export class FormQuoteComponent {
  readonly formSubmit = output<QuoteFormData>();

  protected readonly errors = signal<CotizacionFormErrors>({});

  protected onSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const data = new FormData(form);

    const payload: QuoteFormData = {
      origen: String(data.get('origen') ?? '').trim(),
      destino: String(data.get('destino') ?? '').trim(),
      servicio: String(data.get('servicio') ?? '').trim(),
      peso: Number(data.get('peso') ?? 0),
      volumen: Number(data.get('volumen') ?? 0),
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

  private validate(data: QuoteFormData): CotizacionFormErrors {
    const errors: CotizacionFormErrors = {};

    if (!data.origen) {
      errors.origen = 'El origen es obligatorio.';
    }

    if (!data.destino) {
      errors.destino = 'El destino es obligatorio.';
    }

    if (!data.servicio) {
      errors.servicio = 'El servicio es obligatorio.';
    }

    if (data.peso < 0) {
      errors.peso = 'Ingresa un peso válido (0 o más).';
    }

    if (data.volumen < 0) {
      errors.volumen = 'Ingresa un volumen válido (0 o más).';
    }

    if (data.km < 0) {
      errors.km = 'Ingresa kilómetros válidos (0 o más).';
    }

    return errors;
  }
}
