import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

declare global {
  interface Window {
    Firebug?: {
      chrome?: {
        isInitialized?: boolean;
      };
    };
  }
}

export interface SecurityEvent {
  event: string;
  timestamp: string;
  userAgent: string;
  url: string;
  metadata?: any;
}

export interface PasswordStrengthResult {
  score: number;
  feedback: string[];
  isStrong: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private sessionTimer?: any;
  private apiUrl = `${environment.apiUrl}/security`;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {
    this.initializeSecurityFeatures();
  }

  private initializeSecurityFeatures(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.detectDevTools();
      this.preventContextMenu();
      this.detectSuspiciousActivity();
    }
  }

  // Enhanced DevTools detection with backend logging
  private detectDevTools(): void {
    if (!this.isProduction()) return;

    let devtools = {
      open: false,
      orientation: null
    };

    const threshold = 160;

    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (!(heightThreshold && widthThreshold) &&
          ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)) {
        if (!devtools.open) {
          devtools.open = true;
          this.logSecurityEvent({
            event: 'devtools_opened',
            metadata: {
              widthDiff: window.outerWidth - window.innerWidth,
              heightDiff: window.outerHeight - window.innerHeight
            }
          });
        }
      } else {
        devtools.open = false;
      }
    };

    detectDevTools();
    window.addEventListener('resize', detectDevTools);
  }

  // Production-only security restrictions
  private preventContextMenu(): void {
    if (!this.isProduction()) return;

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C')) ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        this.logSecurityEvent({
          event: 'devtools_shortcut_attempt',
          metadata: { keyCombination: e.key }
        });
        return false;
      }
      return true;
    });
  }

  // Suspicious activity detection with backend integration
  private detectSuspiciousActivity(): void {
    if (!this.isProduction()) return;

    let clickCount = 0;
    let suspiciousKeyCount = 0;

    document.addEventListener('click', () => {
      clickCount++;
      setTimeout(() => clickCount--, 1000);
      
      if (clickCount > 20) {
        this.logSecurityEvent({
          event: 'excessive_clicking',
          metadata: { clickCount }
        });
      }
    });

    document.addEventListener('keydown', (e) => {
      const suspiciousKeys = ['F12', 'F11', 'PrintScreen'];
      if (suspiciousKeys.includes(e.key)) {
        suspiciousKeyCount++;
        if (suspiciousKeyCount > 5) {
          this.logSecurityEvent({
            event: 'suspicious_key_usage',
            metadata: { key: e.key, count: suspiciousKeyCount }
          });
        }
      }
    });

    setInterval(() => suspiciousKeyCount = 0, 60000);
  }

  // Session management with backend sync
  startSessionTimer(onTimeout: () => void): void {
    this.clearSessionTimer();
    
    this.sessionTimer = setTimeout(() => {
      this.logSecurityEvent({ event: 'session_timeout' });
      onTimeout();
    }, this.SESSION_TIMEOUT);
  }

  resetSessionTimer(onTimeout: () => void): void {
    this.startSessionTimer(onTimeout);
  }

  clearSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = undefined;
    }
  }

  // Input validation with backend verification
  sanitizeHtml(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  validateEmail(email: string): Observable<{ valid: boolean; message?: string }> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const basicValidation = emailRegex.test(email) && !this.containsSuspiciousPatterns(email);
    
    if (!basicValidation) {
      return of({ valid: false, message: 'Invalid email format' });
    }

    // Check with backend for additional validation (e.g., disposable email)
    return this.http.post<{ valid: boolean; message?: string }>(
      `${this.apiUrl}/validate-email`,
      { email }
    ).pipe(
      catchError(() => of({ valid: basicValidation }))
    );
  }

  validatePhoneNumber(phone: string): Observable<{ valid: boolean; message?: string }> {
    const uzbekPhoneRegex = /^\+998\d{9}$/;
    const basicValidation = uzbekPhoneRegex.test(phone);
    
    if (!basicValidation) {
      return of({ valid: false, message: 'Invalid Uzbek phone number format' });
    }

    // Check with backend for additional validation
    return this.http.post<{ valid: boolean; message?: string }>(
      `${this.apiUrl}/validate-phone`,
      { phone }
    ).pipe(
      catchError(() => of({ valid: basicValidation }))
    );
  }

  containsSuspiciousPatterns(input: string): boolean {
    const suspiciousPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /('|('')|--|\/\*|\*\/)/gi,
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];

    return suspiciousPatterns.some(pattern => pattern.test(input));
  }

  // Rate limiting with backend coordination
  isRateLimited(action: string, maxAttempts: number = 5, windowMs: number = 60000): Observable<boolean> {
    const key = `rate_limit_${action}`;
    const now = Date.now();
    
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return of(true);
    }

    // Check with backend for global rate limiting
    return this.http.post<{ limited: boolean }>(
      `${this.apiUrl}/rate-limit`,
      { action, timestamp: now }
    ).pipe(
      map(response => response.limited),
      catchError(() => {
        // If backend check fails, use client-side only
        recentAttempts.push(now);
        localStorage.setItem(key, JSON.stringify(recentAttempts));
        return of(false);
      })
    );
  }

  // Password generation with backend strength check
  generateSecurePassword(length: number = 16): Observable<string> {
    // First try to get from backend
    return this.http.get<{ password: string }>(
      `${this.apiUrl}/generate-password`,
      { params: { length: length.toString() } }
    ).pipe(
      map(response => response.password),
      catchError(() => {
        // Fallback to client-side generation
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < length; i++) {
          password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        return of(password);
      })
    );
  }

  // Password strength check with backend verification
  checkPasswordStrength(password: string): Observable<PasswordStrengthResult> {
    // First check client-side
    const clientResult = this.clientSidePasswordCheck(password);
    
    if (!clientResult.isStrong) {
      return of(clientResult);
    }

    // Then verify with backend
    return this.http.post<PasswordStrengthResult>(
      `${this.apiUrl}/check-password-strength`,
      { password }
    ).pipe(
      catchError(() => of(clientResult))
    );
  }

  private clientSidePasswordCheck(password: string): PasswordStrengthResult {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('Password should be at least 8 characters long');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Add uppercase letters');

    if (/\d/.test(password)) score++;
    else feedback.push('Add numbers');

    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push('Add special characters');

    if (password.length >= 12) score++;

    if (/(.)\1{2,}/.test(password)) {
      score--;
      feedback.push('Avoid repeating characters');
    }

    if (/^(?:password|123456|qwerty|abc123)/i.test(password)) {
      score -= 2;
      feedback.push('Avoid common passwords');
    }

    return {
      score: Math.max(0, score),
      feedback,
      isStrong: score >= 4 && feedback.length <= 2
    };
  }

  // Security event logging with backend integration
  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp' | 'userAgent' | 'url'>): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store locally
    const securityLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    securityLogs.push(fullEvent);
    
    if (securityLogs.length > 50) {
      securityLogs.shift();
    }
    
    localStorage.setItem('security_logs', JSON.stringify(securityLogs));

    // Send to backend if available
    if (this.isProduction()) {
      this.http.post(`${this.apiUrl}/log-event`, fullEvent).pipe(
        catchError(() => of(null))
      ).subscribe();
    }
  }

  // Clear sensitive data with backend notification
  clearSensitiveData(): Observable<void> {
    // Clear client-side data
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.reset());

    const passwordFields = document.querySelectorAll('input[type="password"]');
    passwordFields.forEach((field: any) => {
      field.value = '';
      field.type = 'text';
      field.type = 'password';
    });

    // Notify backend
    return this.http.post<void>(`${this.apiUrl}/clear-sensitive-data`, {}).pipe(
      catchError(() => of(undefined))
    );
  }

  // Environment check
  private isProduction(): boolean {
    return isPlatformBrowser(this.platformId) && 
           window.location.hostname !== 'localhost' && 
           window.location.hostname !== '127.0.0.1';
  }

  // Get security logs (for admin purposes)
  getSecurityLogs(): Observable<SecurityEvent[]> {
    if (!isPlatformBrowser(this.platformId)) return of([]);

    // First try to get from backend
    return this.http.get<SecurityEvent[]>(`${this.apiUrl}/logs`).pipe(
      catchError(() => {
        // Fall back to local logs
        const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        return of(logs);
      })
    );
  }
}