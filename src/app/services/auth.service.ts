import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, timer, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { catchError, tap, switchMap, map } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresIn?: number;
}

interface RegisterResponse {
  message: string;
  user?: User;
  token?: string;
  refreshToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authEndpoint = `${environment.apiUrl}${environment.apiEndpoints.auth}`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private tokenRefreshTimer?: any;
  private maxLoginAttempts = 5;
  private loginAttemptWindow = 15 * 60 * 1000; 
  private readonly TOKEN_KEY = 'oromland_access_token';
  private readonly REFRESH_TOKEN_KEY = 'oromland_refresh_token';
  private readonly USER_KEY = 'oromland_current_user';
  private readonly LOGIN_ATTEMPTS_KEY = 'oromland_login_attempts';
  private readonly LAST_ACTIVITY_KEY = 'oromland_last_activity';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.getToken
      ();
      const userData = localStorage.getItem(this.USER_KEY);
      
      if (token && userData) {
        try {
          const user: User = JSON.parse(userData);
          if (this.isTokenValid(token)) {
            this.currentUserSubject.next(user);
            this.scheduleTokenRefresh(token);
            this.updateLastActivity();
          } else {
            this.attemptTokenRefresh().subscribe();
          }
        } catch (error) {
          console.error('Error initializing auth state:', error);
          this.clearAuthData();
        }
      }
    }
  }

  private attemptTokenRefresh(): Observable<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearAuthData();
      return of(false);
    }

    return this.refreshToken().pipe(
      map(() => true),
      catchError(() => {
        this.clearAuthData();
        return of(false);
      })
    );
  }

  private updateLastActivity(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString());
    }
  }

  private isSessionExpired(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    const lastActivity = localStorage.getItem(this.LAST_ACTIVITY_KEY);
    if (!lastActivity) return true;
    
    const inactiveDuration = Date.now() - parseInt(lastActivity, 10);
    return inactiveDuration > environment.session.timeout * 1000;
  }

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    if (!this.canAttemptLogin()) {
      return throwError(() => this.createErrorObject(
        'TOO_MANY_ATTEMPTS',
        'Too many failed login attempts. Please try again later.',
        429
      ));
    }

    const sanitizedCredentials = {
      username: this.sanitizeInput(credentials.username),
      password: credentials.password // Password shouldn't be sanitized
    };

    return this.http.post<LoginResponse>(`${this.authEndpoint.login}`, sanitizedCredentials).pipe(
      tap(response => {
        this.handleSuccessfulAuth(response);
        this.clearLoginAttempts();
      }),
      catchError(error => {
        this.recordLoginAttempt();
        return this.handleAuthError(error);
      })
    );
  }

  register(userData: Partial<User> & { password: string }): Observable<RegisterResponse> {
    const sanitizedData = this.sanitizeUserData(userData);

    return this.http.post<RegisterResponse>(`${this.authEndpoint.register}`, sanitizedData).pipe(
      tap(response => {
        if (response.token && response.user) {
          this.handleSuccessfulAuth({
            token: response.token,
            user: response.user,
            refreshToken: response.refreshToken
          });
        }
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  private handleSuccessfulAuth(response: LoginResponse): void {
    this.saveToken(response.token);
    if (response.refreshToken) {
      this.saveRefreshToken(response.refreshToken);
    }
    this.saveUserData(response.user);
    this.currentUserSubject.next(response.user);
    this.scheduleTokenRefresh(response.token);
    this.updateLastActivity();
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => this.createErrorObject(
        'NO_REFRESH_TOKEN',
        'No refresh token available',
        401
      ));
    }

    return this.http.post<LoginResponse>(`${this.authEndpoint}/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.saveToken(response.token);
        if (response.refreshToken) {
          this.saveRefreshToken(response.refreshToken);
        }
        this.scheduleTokenRefresh(response.token);
      }),
      catchError(error => {
        this.clearAuthData();
        return this.handleAuthError(error);
      })
    );
  }

  logout(manualLogout: boolean = false): Observable<void> {
    if (manualLogout) {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        this.http.post(`${this.authEndpoint}/logout`, { refreshToken }).subscribe();
      }
    }

    this.clearAuthData();
    this.currentUserSubject.next(null);
    return of(undefined);
  }

  private clearAuthData(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.LOGIN_ATTEMPTS_KEY);
      localStorage.removeItem(this.LAST_ACTIVITY_KEY);
    }
    
    if (this.tokenRefreshTimer) {
      this.tokenRefreshTimer.unsubscribe();
    }
  }

  // Role checking utilities
  hasRole(requiredRole: UserRole | UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Password reset functionality
  requestPasswordReset(email: string): Observable<{ message: string }> {
    const sanitizedEmail = this.sanitizeInput(email);
    return this.http.post<{ message: string }>(
      `${this.authEndpoint}/forgot-password`,
      { email: sanitizedEmail }
    ).pipe(catchError(this.handleAuthError.bind(this)));
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.authEndpoint}/reset-password`,
      { token, newPassword }
    ).pipe(catchError(this.handleAuthError.bind(this)));
  }

  // Utility methods
  private createErrorObject(code: string, message: string, status: number): any {
    return {
      error: {
        code,
        message,
        status
      }
    };
  }

  private sanitizeUserData(userData: any): any {
    return {
      ...userData,
      firstName: this.sanitizeInput(userData.firstName),
      lastName: this.sanitizeInput(userData.lastName),
      username: this.sanitizeInput(userData.username),
      email: this.sanitizeInput(userData.email),
      phoneNumber: this.sanitizeInput(userData.phoneNumber),
      // Password shouldn't be sanitized
      password: userData.password
    };
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected authentication error occurred';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
      errorCode = 'CLIENT_ERROR';
    } else {
      errorCode = error.error?.code || `HTTP_${error.status}`;
      errorMessage = error.error?.message || error.message;
      
      if (error.status === 401) {
        this.clearAuthData();
      }
    }
    
    return throwError(() => ({
      error: {
        code: errorCode,
        message: errorMessage,
        status: error.status,
        originalError: error
      }
    }));
  }
}