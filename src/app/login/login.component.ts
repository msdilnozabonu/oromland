import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { SecurityService } from '../services/security.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  loading = false;
  error: string = '';
  successMessage: string = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private securityService: SecurityService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnDestroy(): void {
    // Clean up any subscriptions or resources if needed
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.maxLength(128)
      ]]
    });

    // Check for success message from registration
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.successMessage = params['message'];
        // Clear the message from URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });

    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      const dashboardRoute = this.authService.getDashboardRoute();
      this.router.navigate([dashboardRoute]);
    }
  }

  // Getters for easy access in template
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    this.error = '';
    this.successMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // Check for rate limiting
    if (this.securityService.isRateLimited('login_attempt', 3, 60000)) {
      this.error = 'Too many login attempts. Please wait before trying again.';
      return;
    }

    this.loading = true;

    const { username, password } = this.loginForm.value;

    // Basic input sanitization and validation
    const sanitizedUsername = username.trim();
    
    if (this.securityService.containsSuspiciousPatterns(sanitizedUsername) || 
        this.securityService.containsSuspiciousPatterns(password)) {
      this.error = 'Invalid input detected. Please check your credentials.';
      this.loading = false;
      return;
    }

    this.authService.login({ username: sanitizedUsername, password }).subscribe({
      next: (response) => {
        this.loading = false;
        // Clear sensitive data
        this.securityService.clearSensitiveData();
        
        // Start session management
        this.securityService.startSessionTimer(() => {
          this.authService.logout();
          this.router.navigate(['/login'], {
            queryParams: { message: 'Your session has expired for security reasons.' }
          });
        });
        
        const dashboardRoute = this.authService.getDashboardRoute();
        this.router.navigate([dashboardRoute]);
      },
      error: (err) => {
        this.loading = false;
        
        // Handle specific error cases
        if (err.error?.code === 'TOO_MANY_ATTEMPTS') {
          this.error = err.error.message;
        } else if (err.error?.status === 401) {
          this.error = 'Invalid username or password. Please try again.';
        } else if (err.error?.status === 403) {
          this.error = 'Your account has been suspended. Please contact support.';
        } else if (err.error?.status === 429) {
          this.error = 'Too many login attempts. Please try again later.';
        } else if (err.error?.status >= 500) {
          this.error = 'Server error. Please try again later.';
        } else {
          this.error = err.error?.message || 'Login failed. Please try again.';
        }
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  clearMessages(): void {
    this.error = '';
    this.successMessage = '';
  }
}
