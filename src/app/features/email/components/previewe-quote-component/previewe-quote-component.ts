import { Component, computed, input, output, signal } from '@angular/core';
import { QuoteResult } from '@features/email/models/email-model';
import { ButtonComponent } from '@shared/components/button-component/button-component';

@Component({
  imports: [ButtonComponent],
  selector: 'app-previewe-quote-component',
  templateUrl: './previewe-quote-component.html',
})
export class PrevieweQuoteComponent {
  readonly isLoading = input<boolean>(false);
  readonly quoteResult = input<QuoteResult | null>(null);
  protected readonly recalculate = output<void>();
  protected readonly submit = output<void>();

  protected readonly data = computed<QuoteResult | null>(() => {
    const res = this.quoteResult();
    if (!res) return null

    return res
  });

  protected formatThousands(value: number): string {  
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  } 
}
