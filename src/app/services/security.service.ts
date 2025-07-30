import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Extend the Window interface to include Firebug property
declare global {
  interface Window {
    Firebug?: {
      chrome?: {
        isInitialized?: boolean;
      };
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private sessionTimer?: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initializeSecurityFeatures();
  }

  private initializeSecurityFeatures(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.detectDevTools();
      this.preventContextMenu();
      this.detectSuspiciousActivity();
    }
  }

  // Detect if developer tools are open (basic detection)
  private detectDevTools(): void {
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
          console.warn('Developer tools detected');
          // You can add additional security measures here
        }
      } else {
        devtools.open = false;
      }
    };

    detectDevTools();
    window.addEventListener('resize', detectDevTools);
  }

  // Prevent right-click context menu on production
  private preventContextMenu(): void {
    if (this.isProduction()) {
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
      });

      // Prevent common keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C')) ||
            (e.ctrlKey && e.key === 'U')) {
          e.preventDefault();
          return false;
        }
        // Return true for non-suspicious keys
        return true;
      });
    }
  }

  // Detect suspicious activities
  private detectSuspiciousActivity(): void {
    let clickCount = 0;
    let suspiciousKeyCount = 0;

    // Monitor excessive clicking
    document.addEventListener('click', () => {
      clickCount++;
      setTimeout(() => clickCount--, 1000);
      
      if (clickCount > 20) { // 20 clicks per second is suspicious
        console.warn('Suspicious clicking pattern detected');
        this.logSecurityEvent('excessive_clicking');
      }
    });

    // Monitor suspicious key combinations
    document.addEventListener('keydown', (e) => {
      const suspiciousKeys = ['F12', 'F11', 'PrintScreen'];
      if (suspiciousKeys.includes(e.key)) {
        suspiciousKeyCount++;
        if (suspiciousKeyCount > 5) {
          console.warn('Suspicious key usage detected');
          this.logSecurityEvent('suspicious_keys');
        }
      }
    });

    // Reset suspicious key count every minute
    setInterval(() => {
      suspiciousKeyCount = 0;
    }, 60000);
  }

  // Session management
  startSessionTimer(onTimeout: () => void): void {
    this.clearSessionTimer();
    
    this.sessionTimer = setTimeout(() => {
      console.warn('Session timeout');
      onTimeout();
    }, this.SESSION_TIMEOUT);
  }

  resetSessionTimer(onTimeout: () => void): void {
    this.startSessionTimer(onTimeout);
  }

  clearSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  // Input sanitization
  sanitizeHtml(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && !this.containsSuspiciousPatterns(email);
  }

  validatePhoneNumber(phone: string): boolean {
    const uzbekPhoneRegex = /^\+998\d{9}$/;
    return uzbekPhoneRegex.test(phone);
  }

  // Check for SQL injection patterns
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

  // Rate limiting for client-side
  isRateLimited(action: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const key = `rate_limit_${action}`;
    const now = Date.now();
    
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return true;
    }

    recentAttempts.push(now);
    localStorage.setItem(key, JSON.stringify(recentAttempts));
    return false;
  }

  // Generate secure random password
  generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  // Check password strength
  checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
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

    // Check for common patterns
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

  private isProduction(): boolean {
    return window.location.hostname !== 'localhost' && 
           window.location.hostname !== '127.0.0.1';
  }

  private logSecurityEvent(event: string): void {
    // In production, you would send this to your security monitoring service
    const logEntry = {
      event,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.warn('Security Event:', logEntry);
    
    // Store locally for now (in production, send to server)
    const securityLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    securityLogs.push(logEntry);
    
    // Keep only last 50 logs
    if (securityLogs.length > 50) {
      securityLogs.shift();
    }
    
    localStorage.setItem('security_logs', JSON.stringify(securityLogs));
  }

  // Clear sensitive data from memory (basic implementation)
  clearSensitiveData(): void {
    // Clear form data
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.reset());

    // Clear any password fields
    const passwordFields = document.querySelectorAll('input[type="password"]');
    passwordFields.forEach((field: any) => {
      field.value = '';
      field.type = 'text';
      field.type = 'password'; // Force redraw
    });
  }
}