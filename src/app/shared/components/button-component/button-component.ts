import { Component, input, output } from '@angular/core';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';

@Component({
  imports: [LoadingComponent],
  selector: 'app-button-component',
  templateUrl: './button-component.html',
})
export class ButtonComponent {
  readonly isLoading = input<boolean>(false);
  readonly btnText = input<string>('');
  protected readonly click = output<void>();
}
