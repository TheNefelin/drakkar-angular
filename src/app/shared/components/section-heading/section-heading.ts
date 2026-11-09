import { Component, input } from '@angular/core';

export type SectionHeadingLevel = 'h1' | 'h2';

@Component({
  imports: [],
  selector: 'app-section-heading',
  templateUrl: './section-heading.html',
})
export class SectionHeadingComponent {
  readonly eyebrow = input<string>('');
  readonly title = input<string>('');
  readonly level = input<SectionHeadingLevel>('h2');
}
