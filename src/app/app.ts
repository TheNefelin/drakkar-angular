import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from '@shared/components/toast-component/toast-component';
import { ModalErrorComponent } from '@shared/components/modal-error-component/modal-error-component';

@Component({
  imports: [RouterOutlet, ToastComponent, ModalErrorComponent],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Drakkar Transportes');
}
