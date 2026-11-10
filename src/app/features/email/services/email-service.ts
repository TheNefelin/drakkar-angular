import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { ContactFormData, QuoteFormData } from '@features/email/models/email-model';
import { Observable } from 'rxjs';

@Service()
export class EmailService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'brevo';

  emailContact(item: ContactFormData): Observable<void> {
    return this.apiService.post(this.endpoint, item);
  }

  emailQuote(item: QuoteFormData): Observable<void> {
    return this.apiService.post(this.endpoint, item);
  }

  getTest(): Observable<any> {
    return this.apiService.getAll('health');
  }
}
