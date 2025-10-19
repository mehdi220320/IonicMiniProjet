import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';
import { from, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const firebaseAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return from(authService.getToken()).pipe(
    switchMap(token => {
      const modifiedReq = token
        ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        })
        : req;

      return next(modifiedReq).pipe(
        catchError(err => {
          if (err.status === 401) {
            router.navigate(['/login']);
          }
          throw err;
        })
      );
    })
  );
};
