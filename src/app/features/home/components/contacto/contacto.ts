import { Component, signal } from '@angular/core';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { SectionHeadingComponent } from '@shared/components/section-heading/section-heading';

@Component({
  imports: [RevealDirective, SectionHeadingComponent],
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