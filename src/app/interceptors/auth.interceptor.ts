import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip token addition for auth endpoints
    if (this.isAuthEndpoint(req.url)) {
      return next.handle(req);
    }

    // Add access token to request
    const accessToken = this.tokenService.getAccessToken();
    if (accessToken) {
      req = this.addTokenToRequest(req, accessToken);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized errors
        if (error.status === 401 && !this.isAuthEndpoint(req.url)) {
          return this.handle401Error(req, next);
        }
        
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // Try to refresh token
      if (this.tokenService.hasRefreshToken()) {
        return this.tokenService.refreshAccessToken().pipe(
          switchMap((tokenResponse: any) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(tokenResponse.accessToken);
            
            // Retry original request with new token
            return next.handle(this.addTokenToRequest(request, tokenResponse.accessToken));
          }),
          catchError((refreshError) => {
            this.isRefreshing = false;
            this.tokenService.clearTokens();
            this.router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      } else {
        this.isRefreshing = false;
        this.tokenService.clearTokens();
        this.router.navigate(['/login']);
        return throwError(() => new Error('No refresh token available'));
      }
    } else {
      // If refresh is in progress, wait for it to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addTokenToRequest(request, token)))
      );
    }
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];
    return authEndpoints.some(endpoint => url.includes(endpoint));
  }
}