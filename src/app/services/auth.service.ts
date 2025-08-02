import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, timer, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { catchError, tap, switchMap, map } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';
import { NetworkService } from './network.service';

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
    private router: Router,
    private apiService: ApiService,
    private networkService: NetworkService
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.getToken();
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

    return this.apiService.post<LoginResponse>(environment.apiEndpoints.auth.login, sanitizedCredentials).pipe(
      tap(response => {
        this.handleSuccessfulAuth(response);
        this.clearLoginAttempts();
      }),
      catchError(error => {
        this.recordLoginAttempt();
        // Check network connectivity for better error messages
        const networkStatus = this.networkService.getCurrentStatus();
        if (!networkStatus.isOnline) {
          return throwError(() => this.createErrorObject(
            'NETWORK_OFFLINE',
            'No internet connection. Please check your network and try again.',
            0
          ));
        }
        if (!networkStatus.backendReachable) {
          return throwError(() => this.createErrorObject(
            'BACKEND_UNREACHABLE',
            'Unable to connect to the server. Please try again later.',
            0
          ));
        }
        return this.handleAuthError(error);
      })
    );
  }

  register(userData: Partial<User> & { password: string }): Observable<RegisterResponse> {
    const sanitizedData = this.sanitizeUserData(userData);

    return this.http.post<RegisterResponse>(`${environment.apiUrl}${environment.apiEndpoints.auth.register}`, sanitizedData).pipe(
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

    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken }).pipe(
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
        this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken }).subscribe();
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

  // Authentication status methods
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user && this.isTokenValid(token) && !this.isSessionExpired());
  }

  getCurrentUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    
    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Role checking utilities
  hasRole(requiredRole: UserRole | UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.role) return false;

    const userRole = user.role.name as UserRole;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    return userRole === requiredRole;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.role) return false;
    const userRole = user.role.name as UserRole;
    return roles.includes(userRole);
  }

  hasMinimumRole(requiredRole: UserRole): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.role) return false;

    const roleHierarchy: Record<UserRole, number> = {
      [UserRole.USER]: 1,
      [UserRole.OPERATOR]: 2,
      [UserRole.MANAGER]: 3,
      [UserRole.ADMIN]: 4,
      [UserRole.SUPER_ADMIN]: 5
    };

    const userRole = user.role.name as UserRole;
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  getDashboardRoute(): string {
    const user = this.getCurrentUser();
    if (!user || !user.role) return '/login';

    const userRole = user.role.name as UserRole;
    switch (userRole) {
      case UserRole.SUPER_ADMIN:
        return '/dashboard/super-admin';
      case UserRole.ADMIN:
        return '/dashboard/admin';
      case UserRole.MANAGER:
        return '/dashboard/manager';
      case UserRole.OPERATOR:
        return '/dashboard/operator';
      case UserRole.USER:
      default:
        return '/dashboard/user';
    }
  }

  updateProfile(profileData: Partial<User>): Observable<User> {
    const sanitizedData = this.sanitizeUserData(profileData);
    
    return this.http.put<User>(`${environment.apiUrl}${environment.apiEndpoints.user}/profile`, sanitizedData).pipe(
      tap(updatedUser => {
        this.saveUserData(updatedUser);
        this.currentUserSubject.next(updatedUser);
      }),
      catchError(this.handleAuthError.bind(this))
    );
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
      `${environment.apiUrl}/auth/forgot-password`,
      { email: sanitizedEmail }
    ).pipe(catchError(this.handleAuthError.bind(this)));
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/reset-password`,
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

  // Token management methods
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private getRefreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private saveRefreshToken(refreshToken: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  private saveUserData(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private isTokenValid(token: string): boolean {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  private scheduleTokenRefresh(token: string): void {
    if (this.tokenRefreshTimer) {
      this.tokenRefreshTimer.unsubscribe();
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const refreshTime = expirationTime - currentTime - (5 * 60 * 1000); // Refresh 5 minutes before expiry

      if (refreshTime > 0) {
        this.tokenRefreshTimer = timer(refreshTime).subscribe(() => {
          this.attemptTokenRefresh().subscribe();
        });
      }
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  }

  // Login attempt management
  private canAttemptLogin(): boolean {
    if (!isPlatformBrowser(this.platformId)) return true;
    
    const attemptsData = localStorage.getItem(this.LOGIN_ATTEMPTS_KEY);
    if (!attemptsData) return true;

    try {
      const attempts = JSON.parse(attemptsData);
      const now = Date.now();
      
      // Filter out old attempts
      const recentAttempts = attempts.filter((timestamp: number) => 
        now - timestamp < this.loginAttemptWindow
      );

      return recentAttempts.length < this.maxLoginAttempts;
    } catch (error) {
      return true;
    }
  }

  private recordLoginAttempt(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const attemptsData = localStorage.getItem(this.LOGIN_ATTEMPTS_KEY);
    let attempts: number[] = [];

    if (attemptsData) {
      try {
        attempts = JSON.parse(attemptsData);
      } catch (error) {
        attempts = [];
      }
    }

    const now = Date.now();
    attempts.push(now);
    
    // Keep only recent attempts
    attempts = attempts.filter(timestamp => now - timestamp < this.loginAttemptWindow);
    
    localStorage.setItem(this.LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
  }

  private clearLoginAttempts(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.LOGIN_ATTEMPTS_KEY);
    }
  }

  private sanitizeInput(input: string): string {
    if (!input) return '';
    return input.trim().replace(/[<>]/g, '');
  }
}