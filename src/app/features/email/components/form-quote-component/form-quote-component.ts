import { Component, input, output, signal } from '@angular/core';
import { QuoteFormData } from '@features/email/models/email-model';
import { MessageErrorComponent } from '@shared/components/message-error-component/message-error-component';

@Component({
  imports: [MessageErrorComponent],
  selector: 'app-form-quote-component',
  templateUrl: './form-quote-component.html',
})
export class FormQuoteComponent {
  readonly isLoading = input<boolean>(false);
  protected readonly formSubmit = output<QuoteFormData>();

  protected readonly errorMessage = signal<string | null>(null);
  protected formData = signal<QuoteFormData>({
    origin: '',
    destination: '',
    service: 'Flete',
    weight: 0,
    volume: 0,
    km: 0,
    name: '',
    email: '',
    phone: '',
  });

  protected onNameBeforeInput(event: InputEvent): void {
    // Permite solo letras, acentos, espacios, guiones y apóstrofes.
    const data = event.data ?? '';
    if (data && !/^[\p{L}\p{M} .'-]+$/u.test(data)) {
      event.preventDefault();
    }
  }

  protected onPhoneBeforeInput(event: InputEvent): void {
    // Permite solo dígitos en el campo teléfono.
    const data = event.data ?? '';
    if (data && !/^\d+$/.test(data)) {
      event.preventDefault();
    }
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

  protected updateWeight(value: string): void {
    this.formData.update(d => ({ ...d, weight: Number(value || 0) }));
    this.errorMessage.set(null);
  }

  protected updateVolume(value: string): void {
    this.formData.update(d => ({ ...d, volume: Number(value || 0) }));
    this.errorMessage.set(null);
  }

  protected updateKm(value: string): void {
    this.formData.update(d => ({ ...d, km: Number(value || 0) }));
    this.errorMessage.set(null);
  }

  protected updateName(value: string): void {
    this.formData.update(d => ({ ...d, name: value }));
    this.errorMessage.set(null);
  }

  protected updateEmail(value: string): void {
    this.formData.update(d => ({ ...d, email: value }));
    this.errorMessage.set(null);
  }

  protected updatePhone(value: string): void {
    const normalized = value.replace(/\D/g, '').slice(0, 11);
    this.formData.update(d => ({ ...d, phone: normalized }));
    this.errorMessage.set(null);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    const data = this.formData();

    const payload: QuoteFormData = {
      origin: data.origin.trim(),
      destination: data.destination.trim(),
      service: data.service.trim(),
      weight: Number(data.weight),
      volume: Number(data.volume),
      km: Number(data.km),
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
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
    if (!data.name) {
      return 'El nombre es obligatorio.';
    } else if (!/^[\p{L}\p{M}][\p{L}\p{M} .'-]{0,99}$/u.test(data.name)) {
      return 'El nombre solo puede contener letras, espacios, guiones o apóstrofes.';
    }

    // Correo estricto.
    if (!data.email) {
      return 'El correo es obligatorio.';
    } else if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/.test(data.email)) {
      return 'Ingresa un correo válido.';
    } else if (data.email.length > 254) {
      return 'El correo es demasiado largo.';
    }

    // Teléfono: 11 dígitos.
    if (!data.phone) {
      return 'El teléfono es obligatorio.';
    } else if (!/^\d{11}$/.test(data.phone)) {
      return 'Ingresa un teléfono válido de 11 dígitos.';
    }

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

    // Volumen físico: máximo 20000 m³ o 20000 kg.
    if (data.weight < 0) {
      return 'Ingresa un peso válido (0 o más).';
    } else if (data.weight > 20000) {
      return 'El peso no puede superar los 20000 kg.';
    }

    if (data.volume < 0) {
      return 'Ingresa un volumen válido (0 o más).';
    } else if (data.volume > 20000) {
      return 'El volumen no puede superar los 20000 m³.';
    }

    if (data.km < 0) {
      return 'Ingresa kilómetros válidos (0 o más).';
    } else if (data.km > 5000) {
      return 'El kilómetro no puede superar los 5000 km.';
    }

    return null;
  }
}
