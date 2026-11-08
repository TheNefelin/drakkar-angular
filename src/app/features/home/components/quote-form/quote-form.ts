import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-quote-form',
  templateUrl: './quote-form.html',
})
export class QuoteFormComponent {
  protected readonly submitted = signal(false);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
  }
}