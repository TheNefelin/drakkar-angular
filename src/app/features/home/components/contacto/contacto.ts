import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.html',
})
export class ContactoComponent {
  protected readonly submitted = signal(false);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
  }
}