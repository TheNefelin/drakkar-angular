import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { ErrorService } from "@core/services/error-service";
import { LoggerService } from "@core/services/logger-service";
import { catchError, throwError } from "rxjs";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);
  const loggerService = inject(LoggerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      loggerService.error('HttpInterceptor', `${req.method} ${req.url} -> ${error.status}`, error);

      const message: string = error?.error?.detail || error?.message || 'Error inesperado'

      errorService.show(message);
      return throwError(() => error);
    }),
  );
};
