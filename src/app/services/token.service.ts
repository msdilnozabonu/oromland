import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, timer } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private apiUrl = environment.apiBaseUrl;
  private tokenRefreshSubject = new BehaviorSubject<boolean>(false);
  private refreshTimer: any;
  private isInitialized = false;

  // Token keys
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  // Cache localStorage availability check
  private readonly hasLocalStorage = typeof localStorage !== 'undefined';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    // Initialize asynchronously to avoid blocking app startup
    setTimeout(() => this.initAutoRefresh(), 0);
  }

  /**
   * Store tokens securely
   */
  setTokens(tokenResponse: TokenResponse): void {
    const expiryTime = new Date().getTime() + (tokenResponse.expiresIn * 1000);

    // Store in localStorage for client-side applications
    if (this.hasLocalStorage) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokenResponse.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenResponse.refreshToken);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    } else {
      // Fallback to cookies if localStorage is not available
      const expiryDate = new Date(expiryTime);

      this.cookieService.set(
        this.ACCESS_TOKEN_KEY,
        tokenResponse.accessToken,
        expiryDate,
        '/',
        '',
        environment.production,
        'Strict'
      );

      // Refresh token expires in 30 days
      const refreshExpiryDate = new Date();
      refreshExpiryDate.setDate(refreshExpiryDate.getDate() + 30);

      this.cookieService.set(
        this.REFRESH_TOKEN_KEY,
        tokenResponse.refreshToken,
        refreshExpiryDate,
        '/',
        '',
        environment.production,
        'Strict'
      );

      this.cookieService.set(
        this.TOKEN_EXPIRY_KEY,
        expiryTime.toString(),
        expiryDate,
        '/',
        '',
        environment.production, // secure
        'Strict' // sameSite
      );
    }

    this.scheduleTokenRefresh(tokenResponse.expiresIn);
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    if (this.hasLocalStorage) {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
    return this.cookieService.get(this.ACCESS_TOKEN_KEY) || null;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    if (this.hasLocalStorage) {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return this.cookieService.get(this.REFRESH_TOKEN_KEY) || null;
  }

  /**
   * Check if access token is valid and not expired
   */
  isTokenValid(): boolean {
    const token = this.getAccessToken();
    let expiryStr: string | null = null;

    if (this.hasLocalStorage) {
      expiryStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    } else {
      expiryStr = this.cookieService.get(this.TOKEN_EXPIRY_KEY);
    }

    if (!token || !expiryStr) {
      return false;
    }

    const expiry = parseInt(expiryStr, 10);
    const now = new Date().getTime();

    // Add 5-minute buffer before expiry
    return expiry > (now + 5 * 60 * 1000);
  }

  /**
   * Check if refresh token exists
   */
  hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }

  /**
   * Refresh access token using refresh token
   */
  refreshAccessToken(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const refreshRequest: RefreshTokenRequest = { refreshToken };

    return this.http.post<TokenResponse>(`${this.apiUrl}/auth/refresh`, refreshRequest)
      .pipe(
        tap(response => {
          this.setTokens(response);
          this.tokenRefreshSubject.next(true);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Token refresh failed:', error);
          this.clearTokens();
          return throwError(() => error);
        })
      );
  }

  /**
   * Auto-refresh token before expiry
   */
  private scheduleTokenRefresh(expiresIn: number): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Schedule refresh 5 minutes before expiry
    const refreshTime = Math.max((expiresIn - 300) * 1000, 60000); // Minimum 1 minute

    this.refreshTimer = setTimeout(() => {
      if (this.hasRefreshToken()) {
        this.refreshAccessToken().subscribe({
          next: () => console.log('Token refreshed automatically'),
          error: (error) => console.error('Auto token refresh failed:', error)
        });
      }
    }, refreshTime);
  }

  /**
   * Initialize auto-refresh on service start
   */
  private initAutoRefresh(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;
    
    let expiryStr: string | null = null;

    if (this.hasLocalStorage) {
      expiryStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    } else {
      expiryStr = this.cookieService.get(this.TOKEN_EXPIRY_KEY);
    }

    if (expiryStr) {
      const expiry = parseInt(expiryStr, 10);
      const now = new Date().getTime();
      const timeUntilExpiry = expiry - now;

      if (timeUntilExpiry > 0) {
        const expiresInSeconds = Math.floor(timeUntilExpiry / 1000);
        this.scheduleTokenRefresh(expiresInSeconds);
      } else if (this.hasRefreshToken()) {
        // Token expired, try to refresh asynchronously (non-blocking)
        setTimeout(() => {
          this.refreshAccessToken().subscribe({
            error: () => this.clearTokens()
          });
        }, 1000); // Delay to prevent blocking startup
      }
    }
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    if (this.hasLocalStorage) {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    }

    // Also clear cookies as fallback
    this.cookieService.delete(this.ACCESS_TOKEN_KEY, '/');
    this.cookieService.delete(this.REFRESH_TOKEN_KEY, '/');
    this.cookieService.delete(this.TOKEN_EXPIRY_KEY, '/');

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Get token refresh subject for monitoring refresh events
   */
  getTokenRefreshSubject(): Observable<boolean> {
    return this.tokenRefreshSubject.asObservable();
  }

  /**
   * Decode JWT token payload (client-side only for non-sensitive data)
   */
  decodeToken(token: string = ''): any {
    try {
      const actualToken = token || this.getAccessToken();
      if (!actualToken) return null;

      const payload = actualToken.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get token expiry time
   */
  getTokenExpiry(): Date | null {
    let expiryStr: string | null = null;

    if (this.hasLocalStorage) {
      expiryStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    } else {
      expiryStr = this.cookieService.get(this.TOKEN_EXPIRY_KEY);
    }

    if (!expiryStr) return null;

    return new Date(parseInt(expiryStr, 10));
  }
}
