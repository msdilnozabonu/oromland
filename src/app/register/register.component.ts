import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, RegisterRequest } from '../services/auth.service';
import { Gender } from '../models/user.model';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';
  genders = Object.values(Gender);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      birthDate: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordStrengthValidator(control: AbstractControl): {[key: string]: any} | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[#?!@$%^&*-]/.test(value);

    const valid = hasNumber && hasUpper && hasLower && hasSpecial;
    if (!valid) {
      return { 'passwordStrength': true };
    }
    return null;
  }

  passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';

      const registerData: RegisterRequest = {
        username: this.registerForm.value.username,
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        email: this.registerForm.value.email,
        phoneNumber: this.registerForm.value.phoneNumber,
        birthDate: this.registerForm.value.birthDate,
        gender: this.registerForm.value.gender,
        password: this.registerForm.value.password
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.loading = false;
          // Redirect to appropriate dashboard based on user role
          const dashboardRoute = this.authService.getDashboardRoute();
          this.router.navigate([dashboardRoute]);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }

  // Getter methods for form validation
  get username() { return this.registerForm.get('username'); }
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get phoneNumber() { return this.registerForm.get('phoneNumber'); }
  get birthDate() { return this.registerForm.get('birthDate'); }
  get gender() { return this.registerForm.get('gender'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
}
