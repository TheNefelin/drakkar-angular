import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-message-success-component',
  templateUrl: './message-success-component.html',
})
export class MessageSuccessComponent {
  readonly message = input<string | null>(null);
}
