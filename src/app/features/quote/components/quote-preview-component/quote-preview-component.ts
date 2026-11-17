import { Component, computed, input, output } from '@angular/core';
import { QuoteResult } from '@features/quote/models/quote-model';
import { ButtonComponent } from '@shared/components/button-component/button-component';

@Component({
  imports: [ButtonComponent],
  selector: 'app-quote-preview-component',
  templateUrl: './quote-preview-component.html',
})
export class QuotePreviewComponent {
  readonly isLoading = input<boolean>(false);
  readonly quoteResult = input<QuoteResult | null>(null);
  protected readonly recalculate = output<void>();

  protected readonly data = computed<QuoteResult | null>(() => {
    const res = this.quoteResult();
    if (!res) return null

    return res
  });

  protected formatThousands(value: number): string {  
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  } 
}
