import { Component, output, signal } from '@angular/core';
import { ContactFormData } from '@features/email/models/email-model';
import { SectionHeadingComponent } from '@shared/components/section-heading-component/section-heading-component';

export interface ContactoFormErrors {
  nombre?: string;
  email?: string;
  telefono?: string;
  mensaje?: string;
}

@Component({
  imports: [SectionHeadingComponent],
  selector: 'app-form-contact-component',
  templateUrl: './form-contact-component.html',
})
export class FormContactComponent {
  readonly formSubmit = output<ContactFormData>();

  protected readonly errors = signal<ContactoFormErrors>({});

  protected onSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const data = new FormData(form);

    const payload: ContactFormData = {
      nombre: String(data.get('nombre') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      telefono: String(data.get('telefono') ?? '').trim(),
      mensaje: String(data.get('mensaje') ?? '').trim(),
    };

    const errors = this.validate(payload);
    if (Object.keys(errors).length) {
      this.errors.set(errors);
      return;
    }

    this.errors.set({});
    this.formSubmit.emit(payload);
  }

  private validate(data: ContactFormData): ContactoFormErrors {
    const errors: ContactoFormErrors = {};

    if (!data.nombre) {
      errors.nombre = 'El nombre es obligatorio.';
    }

    if (!data.email) {
      errors.email = 'El correo es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Ingresa un correo válido.';
    }

    if (!data.telefono) {
      errors.telefono = 'El teléfono es obligatorio.';
    } else {
      const digits = data.telefono.replace(/\D/g, '');
      if (digits.length < 8 || digits.length > 15) {
        errors.telefono = 'Ingresa un teléfono válido (8 a 15 dígitos).';
      }
    }

    if (!data.mensaje) {
      errors.mensaje = 'El mensaje es obligatorio.';
    } else if (data.mensaje.length < 5) {
      errors.mensaje = 'Cuéntanos un poco más (mínimo 5 caracteres).';
    }

    return errors;
  }
}
