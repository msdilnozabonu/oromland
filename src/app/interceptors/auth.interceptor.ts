import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip auth header for login, register, and public endpoints
    if (this.isPublicEndpoint(req.url)) {
      return next.handle(req);
    }

    const token = this.authService.getToken();
    
    if (token) {
      req = this.addTokenToRequest(req, token);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle different error scenarios
        if (error.status === 401 && !this.isPublicEndpoint(req.url)) {
          return this.handle401Error(req, next);
        }
        
        if (error.status === 403) {
          // Access denied - user doesn't have permission
          this.router.navigate(['/access-denied']);
        }
        
        if (error.status === 429) {
          // Too many requests - could implement retry logic here
          console.warn('Rate limit exceeded');
        }
        
        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // Try to refresh the token
      const refreshObservable = (this.authService as any).refreshToken?.();
      
      if (refreshObservable) {
        return refreshObservable.pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(response.token);
            return next.handle(this.addTokenToRequest(request, response.token));
          }),
          catchError((error) => {
            this.isRefreshing = false;
            this.authService.logout();
            this.router.navigate(['/login'], {
              queryParams: { message: 'Your session has expired. Please log in again.' }
            });
            return throwError(() => error);
          })
        );
      } else {
        // No refresh token available, logout immediately
        this.isRefreshing = false;
        this.authService.logout();
        this.router.navigate(['/login'], {
          queryParams: { message: 'Your session has expired. Please log in again.' }
        });
        return throwError(() => new Error('Session expired'));
      }
    } else {
      // Token refresh is in progress, wait for it to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => next.handle(this.addTokenToRequest(request, token)))
      );
    }
  }

  private isPublicEndpoint(url: string): boolean {
    const publicEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify',
      '/auth/refresh'
    ];
    
    return publicEndpoints.some(endpoint => url.includes(endpoint));
  }
}