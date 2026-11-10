import { Component, input, output, signal } from '@angular/core';
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

  protected updateName(value: string): void {
    this.formData.update(d => ({ ...d, name: value }));
    this.errorMessage.set(null);
  }

  protected updateEmail(value: string): void {
    this.formData.update(d => ({ ...d, email: value }));
    this.errorMessage.set(null);
  }

  protected updatePhone(value: string): void {
    this.formData.update(d => ({ ...d, phone: value }));
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
    }

    if (!data.email) {
      return 'El correo es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return 'Ingresa un correo válido.';
    }

    if (!data.phone) {
      return 'El teléfono es obligatorio.';
    } else {
      const digits = data.phone.replace(/\D/g, '');
      if (digits.length < 8 || digits.length > 15) {
        return 'Ingresa un teléfono válido (8 a 15 dígitos).';
      }
    }

    if (!data.message) {
      return 'El mensaje es obligatorio.';
    } else if (data.message.length < 5) {
      return 'Cuéntanos un poco más (mínimo 5 caracteres).';
    }

    return null;
  }
}
