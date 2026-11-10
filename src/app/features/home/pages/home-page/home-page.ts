import { Component, inject, signal } from '@angular/core';
import { HeroComponent } from '@features/home/components/hero-component/hero-component';
import { ServicesComponent } from '@features/home/components/services-component/services-component';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { SectionHeadingComponent } from '@shared/components/section-heading-component/section-heading-component';
import { FormContactComponent } from '@features/email/components/form-contact-component/form-contact-component';
import { EmailService } from '@features/email/services/email-service';
import { LoggerService } from '@core/services/logger-service';
import { ToastService } from '@core/services/toast-service';
import { ErrorService } from '@core/services/error-service';
import { firstValueFrom } from 'rxjs';
import { ContactFormData } from '@features/email/models/email-model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  imports: [HeroComponent, ServicesComponent, FormContactComponent, RevealDirective, SectionHeadingComponent],
  selector: 'app-home-page',
  templateUrl: './home-page.html',
})
export class HomePage {
  // SERVICES ---------------------------------------------------------------  
  private readonly loggerService = inject(LoggerService);
  private readonly toastService = inject(ToastService);
  private readonly errorService = inject(ErrorService);
  
  // STATES -----------------------------------------------------------------
  protected readonly isLoading = signal<boolean>(false);
  protected readonly isDisabled = signal<boolean>(false);

  // FETCH-SERVICES-STATES --------------------------------------------------
  private readonly emailService = inject(EmailService);

  // EVENTS -----------------------------------------------------------------

  // CRUD -------------------------------------------------------------------
  protected async onSubmitForm(form: ContactFormData): Promise<void> {
    this.isLoading.set(true);
    this.isDisabled.set(true);

    try {
      //const response = await firstValueFrom(this.emailService.emailContact(form));
      this.toastService.show('Mensaje enviado correctamente', 'success');
    } catch (error: unknown) {
      this.loggerService.error('HomePage', 'onSubmitForm', error);
    
      if (!(error instanceof HttpErrorResponse)) {
        this.errorService.show("Error al enviar Email");
      }
    } finally {
      this.isLoading.set(false);
      this.isDisabled.set(false);
    }
  }
}