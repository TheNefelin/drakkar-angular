import { Component, computed, input, output, signal } from '@angular/core';
import { ContactFormData } from '@features/email/models/email-model';
import { MessageErrorComponent } from '@shared/components/message-error-component/message-error-component';

@Component({
  imports: [MessageErrorComponent],
  selector: 'app-form-contact-component',
  templateUrl: './form-contact-component.html',
})
export class FormContactComponent {
  readonly isLoading = input<boolean>(false); 
  protected readonly formSubmit = output<ContactFormData>();

  protected readonly errorMessage = signal<string | null>(null);
  protected formData = signal<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  protected readonly messageCounter = computed(() => this.formData().message.length);

  protected onNameBeforeInput(event: InputEvent): void {
    // Permite solo letras, acentos, espacios, guiones y apóstrofes.
    const data = event.data ?? '';
    if (data && !/^[\p{L}\p{M} .'-]+$/u.test(data)) {
      event.preventDefault();
    }
  }

  protected updateName(value: string): void {
    this.formData.update(d => ({ ...d, name: value }));
    this.errorMessage.set(null);
  }

  protected updateEmail(value: string): void {
    this.formData.update(d => ({ ...d, email: value }));
    this.errorMessage.set(null);
  }

  protected onPhoneBeforeInput(event: InputEvent): void {
    // Permite solo dígitos en el campo teléfono.
    const data = event.data ?? '';
    if (data && !/^\d+$/.test(data)) {
      event.preventDefault();
    }
  }

  protected updatePhone(value: string): void {
    const normalized = value.replace(/\\D/g, '').slice(0, 11);
    this.formData.update(d => ({ ...d, phone: normalized }));
    this.errorMessage.set(null);
  }

  protected updateMessage(value: string): void {
    this.formData.update(d => ({ ...d, message: value }));
    this.errorMessage.set(null);
  }  

  protected onSubmit(event: Event): void {
    event.preventDefault();
    const data = this.formData();

    const payload: ContactFormData = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      message: data.message.trim(),
    };

    const error = this.validate(payload);
    if (error) {
      this.errorMessage.set(error);
      return
    }

    this.errorMessage.set(null);
    this.formSubmit.emit(payload);
  }

  private validate(data: ContactFormData): string | null {
    if (!data.name) {
      return 'El nombre es obligatorio.';
    } else if (!/^[\p{L}\p{M}][\p{L}\p{M} .'-]{0,99}$/u.test(data.name)) {
      return 'El nombre solo puede contener letras, espacios, guiones o apóstrofes.';
    }

    if (!data.email) {
      return 'El correo es obligatorio.';
    } else if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/.test(data.email)) {
      return 'Ingresa un correo válido.';
    } else if (data.email.length > 254) {
      return 'El correo es demasiado largo.';
    }

    if (!data.phone) {
      return 'El teléfono es obligatorio.';
    } else if (!/^\\d{11}$/.test(data.phone)) {
      return 'Ingresa un teléfono válido de 11 dígitos.';
    }

    if (!data.message) {
      return 'El mensaje es obligatorio.';
    } else if (data.message.length < 5) {
      return 'Cuéntanos un poco más (mínimo 5 caracteres).';
    } else if (data.message.length > 500) {
      return 'El mensaje no puede superar los 500 caracteres.';
    }

    return null;
  }
}
