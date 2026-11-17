import { Component, effect, input, output, signal } from '@angular/core';
import { QuoteFormDetailData } from '@features/quote/models/quote-model';
import { MessageErrorComponent } from '@shared/components/message-error-component/message-error-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';

@Component({
  imports: [MessageErrorComponent, ButtonComponent],
  selector: 'app-quote-form-detail-component',
  templateUrl: './quote-form-detail-component.html',
})
export class QuoteFormDetailComponent {
  // INPUTS/OUTPUTS ---------------------------------------------------------
  readonly isLoading = input<boolean>(false);
  readonly resetTrigger = input<number>(0);
  protected readonly formSubmit = output<QuoteFormDetailData>();
  protected readonly valuesChanged = output<QuoteFormDetailData>();

  // STATES -----------------------------------------------------------------  
  protected readonly errorMessage = signal<string | null>(null);
  protected formData = signal<QuoteFormDetailData>({
    weight: 0,
    volume: 0,
    name: '',
    email: '',
    phone: '',
  });

  constructor() {
    effect(() => {
      if (this.resetTrigger()) {
        this.formData.set({
          weight: 0,
          volume: 0,
          name: '',
          email: '',
          phone: '',
        });
        this.emitValues();
      }
    });
  }

  private emitValues(): void {
    this.valuesChanged.emit(this.formData());
  }

  protected updateWeight(value: string): void {
    this.formData.update(d => ({ ...d, weight: Number(value || 0) }));
    this.errorMessage.set(null);
    this.emitValues();
  }

  protected updateVolume(value: string): void {
    this.formData.update(d => ({ ...d, volume: Number(value || 0) }));
    this.errorMessage.set(null);
    this.emitValues();
  }

  protected updateName(value: string): void {
    this.formData.update(d => ({ ...d, name: value }));
    this.errorMessage.set(null);
    this.emitValues();
  }

  protected updateEmail(value: string): void {
    this.formData.update(d => ({ ...d, email: value }));
    this.errorMessage.set(null);
    this.emitValues();
  }

  protected updatePhone(value: string): void {
    const normalized = value.replace(/\D/g, '').slice(0, 11);
    this.formData.update(d => ({ ...d, phone: normalized }));
    this.errorMessage.set(null);
    this.emitValues();
  }

  // EVENTS -----------------------------------------------------------------
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
  
  protected onSubmit(event?: Event): void {
    event?.preventDefault();
    const data = this.formData();

    const payload: QuoteFormDetailData = {
      weight: Number(data.weight),
      volume: Number(data.volume),
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

  private validate(data: QuoteFormDetailData): string | null {
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

    return null;
  }
}
