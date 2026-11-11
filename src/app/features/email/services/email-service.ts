import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { ContactFormData, QuoteResult } from '@features/email/models/email-model';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@shared/constants/api-endpoints';

@Service()
export class EmailService {
  private readonly apiService = inject(ApiService);

  emailContact(item: ContactFormData): Observable<void> {
    return this.apiService.post(API_ENDPOINTS.contact, item);
  }

  emailQuote(item: QuoteResult): Observable<void> {
    return this.apiService.post(API_ENDPOINTS.quote, item);
  }
}
