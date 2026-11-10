import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-modal-error-component',
  templateUrl: './modal-error-component.html',
})
export class ModalErrorComponent {
  readonly message = input<string | null>(null);
  readonly closed = output<void>();
}
