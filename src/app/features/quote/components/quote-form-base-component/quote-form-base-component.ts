import { Component, effect, input, output, signal } from '@angular/core';
import { QuoteFormData } from '@features/quote/models/quote-model';
import { MessageErrorComponent } from '@shared/components/message-error-component/message-error-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';

@Component({
  imports: [MessageErrorComponent, ButtonComponent],
  selector: 'app-quote-form-base-component',
  templateUrl: './quote-form-base-component.html',
})
export class QuoteFormBaseComponent {
  // INPUTS/OUTOUTS ---------------------------------------------------------
  readonly isLoading = input<boolean>(false);
  readonly resetTrigger = input<number>(0);
  protected readonly formSubmit = output<QuoteFormData>();

  // STATES -----------------------------------------------------------------
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly formData = signal<QuoteFormData>({
    origin: "",
    destination: "",
    service: "Flete",
    km: 0,
  });

  constructor() {
    effect(() => {
      if (this.resetTrigger()) {
        this.formData.set({
          origin: '',
          destination: '',
          service: 'Flete',
          km: 0,
        });
      }
    });
  }

  protected updateOrigin(value: string): void {
    this.formData.update(d => ({ ...d, origin: value }));
    this.errorMessage.set(null);
  }

  protected updateDestination(value: string): void {
    this.formData.update(d => ({ ...d, destination: value }));
    this.errorMessage.set(null);
  }

  protected updateService(value: string): void {
    this.formData.update(d => ({ ...d, service: value }));
    this.errorMessage.set(null);
  }

  protected updateKm(value: string): void {
    this.formData.update(d => ({ ...d, km: Number(value || 0) }));
    this.errorMessage.set(null);
  }

  // EVENTS -----------------------------------------------------------------
  protected onSubmit(event?: Event): void {
    event?.preventDefault();
    const data = this.formData();

    const payload: QuoteFormData = {
      origin: data.origin.trim(),
      destination: data.destination.trim(),
      service: data.service.trim(),
      km: Number(data.km),
    };

    const error = this.validate(payload);
    if (error) {
      this.errorMessage.set(error);
      return;
    }

    this.errorMessage.set(null);
    this.formSubmit.emit(payload);
  }

  private validate(data: QuoteFormData): string | null {
    // Solo letras, acentos, espacios, guiones y apóstrofes.

    // Origen y destino.
    if (!data.origin) {
      return 'El origen es obligatorio.';
    } else if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ0-9 .,'-]{1,199}$/u.test(data.origin)) {
      return 'El origen contiene caracteres no válidos.';
    }

    if (!data.destination) {
      return 'El destino es obligatorio.';
    } else if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ0-9 .,'-]{1,199}$/u.test(data.destination)) {
      return 'El destino contiene caracteres no válidos.';
    }

    // Servicio.
    if (!data.service) {
      return 'El servicio es obligatorio.';
    }

    // Km obligatorio (sin estimado por largos de texto).
    if (!data.km || data.km <= 0) {
      return 'Ingresa los kilómetros del trayecto.';
    } else if (data.km > 5000) {
      return 'Los kilómetros no pueden superar los 5000 km.';
    }

    return null;
  }
}