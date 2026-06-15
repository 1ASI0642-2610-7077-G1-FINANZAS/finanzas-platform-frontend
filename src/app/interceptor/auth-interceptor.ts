import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import {AuthService} from '../services/auth-service';
import {Router} from '@angular/router';

@Injectable()
export class authInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private router = inject(Router);
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    let authReq = req
    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if(error.status === 403){
          this.authService.logout()
        }
        return throwError(() => error);
      })
    );
  }
}
