import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, timer } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { Router } from '@angular/router';

interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresIn?: number;
}

interface RegisterResponse {
  message: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://oromland.uz/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private tokenRefreshTimer?: any;
  private maxLoginAttempts = 5;
  private loginAttemptWindow = 15 * 60 * 1000; // 15 minutes
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';
  private readonly LOGIN_ATTEMPTS_KEY = 'login_attempts';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.loadCurrentUser();
    this.setupTokenRefresh();
  }

  private loadCurrentUser(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.getToken();
      const userData = localStorage.getItem(this.USER_KEY);
      
      if (token && userData && this.isTokenValid(token)) {
        try {
          const user: User = JSON.parse(userData);
          this.currentUserSubject.next(user);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          this.logout();
        }
      } else {
        this.logout();
      }
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  private setupTokenRefresh(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.getToken();
      if (token && this.isTokenValid(token)) {
        this.scheduleTokenRefresh(token);
      }
    }
  }

  private scheduleTokenRefresh(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const now = Date.now();
      const refreshTime = expirationTime - now - (5 * 60 * 1000); // Refresh 5 minutes before expiration

      if (refreshTime > 0) {
        this.tokenRefreshTimer = timer(refreshTime).subscribe(() => {
          this.refreshToken().subscribe({
            error: () => this.logout()
          });
        });
      }
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  }

  private refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/refresh`, { 
      refreshToken 
    }).pipe(
      tap(response => {
        this.saveToken(response.token);
        if (response.refreshToken) {
          this.saveRefreshToken(response.refreshToken);
        }
        this.scheduleTokenRefresh(response.token);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  private canAttemptLogin(): boolean {
    if (!isPlatformBrowser(this.platformId)) return true;
    
    const attemptsData = localStorage.getItem(this.LOGIN_ATTEMPTS_KEY);
    if (!attemptsData) return true;

    try {
      const { count, timestamp } = JSON.parse(attemptsData);
      const now = Date.now();
      
      // Reset attempts if window has expired
      if (now - timestamp > this.loginAttemptWindow) {
        localStorage.removeItem(this.LOGIN_ATTEMPTS_KEY);
        return true;
      }
      
      return count < this.maxLoginAttempts;
    } catch {
      localStorage.removeItem(this.LOGIN_ATTEMPTS_KEY);
      return true;
    }
  }

  private recordLoginAttempt(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const attemptsData = localStorage.getItem(this.LOGIN_ATTEMPTS_KEY);
    let count = 1;
    
    if (attemptsData) {
      try {
        const data = JSON.parse(attemptsData);
        count = data.count + 1;
      } catch {
        count = 1;
      }
    }
    
    localStorage.setItem(this.LOGIN_ATTEMPTS_KEY, JSON.stringify({
      count,
      timestamp: Date.now()
    }));
  }

  private clearLoginAttempts(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.LOGIN_ATTEMPTS_KEY);
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    // Check if login attempts exceeded
    if (!this.canAttemptLogin()) {
      return throwError(() => ({
        error: { 
          message: `Too many failed login attempts. Please try again later.`,
          code: 'TOO_MANY_ATTEMPTS'
        }
      }));
    }

    // Sanitize inputs
    const sanitizedUsername = this.sanitizeInput(username);
    const loginData = {
      username: sanitizedUsername,
      password: password
    };

    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, loginData).pipe(
      tap(response => {
        // Clear login attempts on successful login
        this.clearLoginAttempts();
        
        // Store tokens and user data
        this.saveToken(response.token);
        if (response.refreshToken) {
          this.saveRefreshToken(response.refreshToken);
        }
        this.saveUserData(response.user);
        
        // Update current user subject
        this.currentUserSubject.next(response.user);
        
        // Schedule token refresh
        this.scheduleTokenRefresh(response.token);
      }),
      catchError((error: HttpErrorResponse) => {
        // Record failed attempt
        this.recordLoginAttempt();
        return this.handleError(error);
      })
    );
  }

  register(userData: any): Observable<RegisterResponse> {
    // Sanitize user input
    const sanitizedData = {
      firstName: this.sanitizeInput(userData.firstName),
      lastName: this.sanitizeInput(userData.lastName),
      username: this.sanitizeInput(userData.username),
      email: this.sanitizeInput(userData.email),
      phoneNumber: this.sanitizeInput(userData.phoneNumber),
      birthDate: userData.birthDate,
      gender: userData.gender,
      password: userData.password // Don't sanitize password as it may contain special chars
    };

    return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register`, sanitizedData).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
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

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  logout(): void {
    // Clear timer
    if (this.tokenRefreshTimer) {
      this.tokenRefreshTimer.unsubscribe();
    }

    // Make logout API call (optional)
    this.http.post(`${this.baseUrl}/auth/logout`, {}).subscribe({
      error: () => {} // Ignore logout API errors
    });

    // Clear all stored data
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.LOGIN_ATTEMPTS_KEY);
    }
    
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && this.isTokenValid(token);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getDashboardRoute(): string {
    const user = this.getCurrentUser();
    if (!user) return '/login';
    
    // Convert role to string for comparison
    const userRole = String(user.role);
    
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

  private sanitizeInput(input: string): string {
    return input.trim().replace(/[<>\"']/g, '');
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Invalid request';
          break;
        case 401:
          errorMessage = 'Invalid credentials';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Service not found';
          break;
        case 409:
          errorMessage = error.error?.message || 'Conflict - resource already exists';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation failed';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later';
          break;
        default:
          errorMessage = error.error?.message || `Error Code: ${error.status}`;
      }
    }
    
    return throwError(() => ({
      error: { message: errorMessage, status: error.status }
    }));
  }

  // Method to check if user has specific role
  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === (role as any);
  }

  // Method to check if user has minimum role level
  hasMinimumRole(minimumRole: UserRole): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.role) return false;

    const roleHierarchy: { [key: string]: number } = {
      [UserRole.USER]: 1,
      [UserRole.OPERATOR]: 2,
      [UserRole.MANAGER]: 3,
      [UserRole.ADMIN]: 4,
      [UserRole.SUPER_ADMIN]: 5
    };

    const userRoleLevel = roleHierarchy[String(user.role)];
    const minimumRoleLevel = roleHierarchy[minimumRole];

    return userRoleLevel >= minimumRoleLevel;
  }

  // Method to change password
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/change-password`, {
      currentPassword,
      newPassword
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Method to request password reset
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/forgot-password`, {
      email: this.sanitizeInput(email)
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Method to verify account
  verifyAccount(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/verify`, {
      token
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Method to update user profile
  updateProfile(profileData: any): Observable<any> {
    const sanitizedData = {
      firstName: this.sanitizeInput(profileData.firstName),
      lastName: this.sanitizeInput(profileData.lastName),
      email: this.sanitizeInput(profileData.email),
      phoneNumber: this.sanitizeInput(profileData.phoneNumber),
      birthDate: profileData.birthDate
    };

    return this.http.put(`${this.baseUrl}/auth/profile`, sanitizedData).pipe(
      tap((response: any) => {
        // Update the stored user data if the response includes updated user info
        if (response.user) {
          this.saveUserData(response.user);
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }
}