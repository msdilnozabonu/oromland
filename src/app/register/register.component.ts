import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  error: string = '';
  genders = ['MALE', 'FEMALE'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.maxLength(50),
        this.nameValidator
      ]],
      lastName: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.maxLength(50),
        this.nameValidator
      ]],
      username: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(30),
        this.usernameValidator
      ]],
      email: ['', [
        Validators.required, 
        Validators.email,
        this.emailValidator
      ]],
      phoneNumber: ['', [
        Validators.required, 
        Validators.pattern(/^\+998\d{9}$/)
      ]],
      birthDate: ['', [
        Validators.required,
        this.ageValidator
      ]],
      gender: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // --- Form Control Getters ---
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get username() { return this.registerForm.get('username'); }
  get email() { return this.registerForm.get('email'); }
  get phoneNumber() { return this.registerForm.get('phoneNumber'); }
  get birthDate() { return this.registerForm.get('birthDate'); }
  get gender() { return this.registerForm.get('gender'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  // --- Submit Handler ---
  onSubmit(): void {
    this.error = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.markFieldErrors();
      return;
    }

    this.loading = true;

    const formData = { ...this.registerForm.value };
    delete formData.confirmPassword;
    
    // Convert birthDate to ISO string if it's a Date object
    if (formData.birthDate) {
      formData.birthDate = new Date(formData.birthDate).toISOString().split('T')[0];
    }

    this.authService.register(formData).subscribe({
      next: (response) => {
        this.loading = false;
        // Show success message and redirect to login
        this.router.navigate(['/login'], { 
          queryParams: { 
            message: 'Registration successful! Please log in with your credentials.' 
          } 
        });
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }

  private markFieldErrors(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
  }

  // --- Custom Validators ---
  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#\$%\^\&*\)\(+=._-]/.test(value);
    
    const errors: ValidationErrors = {};
    
    if (!hasUpper) errors['noUppercase'] = true;
    if (!hasLower) errors['noLowercase'] = true;
    if (!hasNumber) errors['noNumber'] = true;
    if (!hasSpecial) errors['noSpecial'] = true;
    
    // Check for common patterns
    if (/(.)\1{2,}/.test(value)) errors['repeatingChars'] = true;
    if (/^(?:password|123456|qwerty|abc123)/i.test(value)) errors['commonPassword'] = true;
    
    return Object.keys(errors).length ? errors : null;
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    // Only letters, spaces, hyphens, and apostrophes allowed
    const namePattern = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    if (!namePattern.test(value)) {
      return { invalidName: true };
    }
    
    // Check for excessive spaces or special characters
    if (/\s{2,}/.test(value) || /[-']{2,}/.test(value)) {
      return { invalidNameFormat: true };
    }
    
    return null;
  }

  usernameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    // Username: letters, numbers, underscores, hyphens only
    const usernamePattern = /^[a-zA-Z0-9_-]+$/;
    if (!usernamePattern.test(value)) {
      return { invalidUsername: true };
    }
    
    // Cannot start with number or special character
    if (/^[0-9_-]/.test(value)) {
      return { usernameStartsInvalid: true };
    }
    
    return null;
  }

  emailValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    // More strict email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(value)) {
      return { invalidEmailFormat: true };
    }
    
    // Check for suspicious patterns
    if (value.includes('..') || value.startsWith('.') || value.endsWith('.')) {
      return { suspiciousEmail: true };
    }
    
    return null;
  }

  ageValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    const birthDate = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      const actualAge = age - 1;
      if (actualAge < 13) {
        return { tooYoung: true };
      }
    }
    
    if (age > 120) {
      return { tooOld: true };
    }
    
    if (birthDate > today) {
      return { futureDate: true };
    }
    
    return null;
  }

  // Helper method to get password strength
  getPasswordStrength(): string {
    const password = this.password?.value;
    if (!password) return '';
    
    const errors = this.passwordStrengthValidator(this.password!);
    if (!errors) return 'strong';
    
    const errorCount = Object.keys(errors).length;
    if (errorCount <= 2) return 'medium';
    return 'weak';
  }
}
