import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
    MatDividerModule,
    MatCheckboxModule
  ],
  template: `
    <div class="account-settings-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Account Settings</h1>
      </div>

      <mat-tab-group class="settings-tabs">
        <!-- Profile Tab -->
        <mat-tab label="Profile Information">
          <div class="tab-content">
            <mat-card class="settings-card">
              <mat-card-header>
                <mat-card-title>Personal Information</mat-card-title>
                <mat-card-subtitle>Update your personal details</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                  <div class="profile-photo-section">
                    <div class="photo-container">
                      <img [src]="currentUser?.avatar || 'assets/images/user-default.png'" 
                           [alt]="currentUser?.firstName" class="profile-photo">
                      <button type="button" mat-mini-fab color="primary" class="photo-edit-btn"
                              (click)="changePhoto()">
                        <mat-icon>camera_alt</mat-icon>
                      </button>
                    </div>
                    <input type="file" #photoInput accept="image/*" style="display: none"
                           (change)="onPhotoSelected($event)">
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>First Name</mat-label>
                      <input matInput formControlName="firstName">
                      <mat-error *ngIf="profileForm.get('firstName')?.hasError('required')">
                        First name is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Last Name</mat-label>
                      <input matInput formControlName="lastName">
                      <mat-error *ngIf="profileForm.get('lastName')?.hasError('required')">
                        Last name is required
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Email</mat-label>
                      <input matInput formControlName="email" type="email">
                      <mat-error *ngIf="profileForm.get('email')?.hasError('required')">
                        Email is required
                      </mat-error>
                      <mat-error *ngIf="profileForm.get('email')?.hasError('email')">
                        Enter a valid email
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Phone Number</mat-label>
                      <input matInput formControlName="phoneNumber" type="tel">
                      <mat-error *ngIf="profileForm.get('phoneNumber')?.hasError('required')">
                        Phone number is required
                      </mat-error>
                      <mat-error *ngIf="profileForm.get('phoneNumber')?.hasError('pattern')">
                        Enter a valid phone number (+998XXXXXXXXX)
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Address</mat-label>
                      <textarea matInput formControlName="address" rows="2"></textarea>
                    </mat-form-field>
                  </div>

                  <div class="form-actions">
                    <button mat-raised-button color="primary" type="submit" 
                            [disabled]="!profileForm.valid || isUpdatingProfile">
                      <mat-icon *ngIf="!isUpdatingProfile">save</mat-icon>
                      <mat-icon *ngIf="isUpdatingProfile" class="spinning">hourglass_empty</mat-icon>
                      {{isUpdatingProfile ? 'Saving...' : 'Save Changes'}}
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Security Tab -->
        <mat-tab label="Security">
          <div class="tab-content">
            <mat-card class="settings-card">
              <mat-card-header>
                <mat-card-title>Change Password</mat-card-title>
                <mat-card-subtitle>Update your account password</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Current Password</mat-label>
                      <input matInput formControlName="currentPassword" 
                             [type]="hideCurrentPassword ? 'password' : 'text'">
                      <button mat-icon-button matSuffix type="button"
                              (click)="hideCurrentPassword = !hideCurrentPassword">
                        <mat-icon>{{hideCurrentPassword ? 'visibility' : 'visibility_off'}}</mat-icon>
                      </button>
                      <mat-error *ngIf="passwordForm.get('currentPassword')?.hasError('required')">
                        Current password is required
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>New Password</mat-label>
                      <input matInput formControlName="newPassword" 
                             [type]="hideNewPassword ? 'password' : 'text'">
                      <button mat-icon-button matSuffix type="button"
                              (click)="hideNewPassword = !hideNewPassword">
                        <mat-icon>{{hideNewPassword ? 'visibility' : 'visibility_off'}}</mat-icon>
                      </button>
                      <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">
                        New password is required
                      </mat-error>
                      <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">
                        Password must be at least 6 characters
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Confirm New Password</mat-label>
                      <input matInput formControlName="confirmPassword" 
                             [type]="hideConfirmPassword ? 'password' : 'text'">
                      <button mat-icon-button matSuffix type="button"
                              (click)="hideConfirmPassword = !hideConfirmPassword">
                        <mat-icon>{{hideConfirmPassword ? 'visibility' : 'visibility_off'}}</mat-icon>
                      </button>
                      <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
                        Please confirm your new password
                      </mat-error>
                      <mat-error *ngIf="passwordForm.hasError('passwordMismatch')">
                        Passwords do not match
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-actions">
                    <button mat-raised-button color="primary" type="submit" 
                            [disabled]="!passwordForm.valid || isChangingPassword">
                      <mat-icon *ngIf="!isChangingPassword">lock_reset</mat-icon>
                      <mat-icon *ngIf="isChangingPassword" class="spinning">hourglass_empty</mat-icon>
                      {{isChangingPassword ? 'Changing...' : 'Change Password'}}
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Preferences Tab -->
        <mat-tab label="Preferences">
          <div class="tab-content">
            <mat-card class="settings-card">
              <mat-card-header>
                <mat-card-title>Account Preferences</mat-card-title>
                <mat-card-subtitle>Customize your account settings</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="preferences-section">
                  <h4>Notifications</h4>
                  <div class="preference-item">
                    <mat-checkbox [(ngModel)]="preferences.emailNotifications">
                      Email notifications for booking updates
                    </mat-checkbox>
                  </div>
                  <div class="preference-item">
                    <mat-checkbox [(ngModel)]="preferences.smsNotifications">
                      SMS notifications for important updates
                    </mat-checkbox>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <div class="preferences-section">
                  <h4>Privacy</h4>
                  <div class="preference-item">
                    <mat-checkbox [(ngModel)]="preferences.publicProfile">
                      Make my profile visible to other users
                    </mat-checkbox>
                  </div>
                  <div class="preference-item">
                    <mat-checkbox [(ngModel)]="preferences.shareData">
                      Allow sharing anonymized data for service improvement
                    </mat-checkbox>
                  </div>
                </div>

                <div class="form-actions">
                  <button mat-raised-button color="primary" (click)="savePreferences()"
                          [disabled]="isSavingPreferences">
                    <mat-icon *ngIf="!isSavingPreferences">save</mat-icon>
                    <mat-icon *ngIf="isSavingPreferences" class="spinning">hourglass_empty</mat-icon>
                    {{isSavingPreferences ? 'Saving...' : 'Save Preferences'}}
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .account-settings-container {
      padding: 2rem;
      background: #ffffff;
      min-height: 100vh;
    }

    .header {
      display: flex;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    .header h1 {
      color: #2d3748;
      font-size: 2rem;
      font-weight: 600;
      margin: 0;
    }

    .back-btn {
      background: #ffffff;
      border: 2px solid #4CAF50;
      color: #4CAF50;
    }

    .settings-tabs {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .tab-content {
      padding: 2rem;
    }

    .settings-card {
      border: none;
      box-shadow: none;
      background: transparent;
    }

    .profile-photo-section {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
    }

    .photo-container {
      position: relative;
      display: inline-block;
    }

    .profile-photo {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #4CAF50;
    }

    .photo-edit-btn {
      position: absolute;
      bottom: 5px;
      right: 5px;
      width: 36px;
      height: 36px;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .preferences-section {
      margin: 2rem 0;
    }

    .preferences-section h4 {
      color: #2d3748;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .preference-item {
      margin: 1rem 0;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .account-settings-container {
        padding: 1rem;
      }

      .header h1 {
        font-size: 1.5rem;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .half-width {
        width: 100%;
      }

      .tab-content {
        padding: 1rem;
      }
    }
  `]
})
export class AccountSettingsComponent implements OnInit {
  currentUser: any;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isUpdatingProfile = false;
  isChangingPassword = false;
  isSavingPreferences = false;
  
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  preferences = {
    emailNotifications: true,
    smsNotifications: false,
    publicProfile: false,
    shareData: true
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+998\d{9}$/)]],
      address: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUserData();
    this.loadPreferences();
  }

  private loadUserData(): void {
    if (this.currentUser) {
      this.profileForm.patchValue({
        firstName: this.currentUser.firstName || '',
        lastName: this.currentUser.lastName || '',
        email: this.currentUser.email || '',
        phoneNumber: this.currentUser.phoneNumber || '',
        address: this.currentUser.address || ''
      });
    }
  }

  private loadPreferences(): void {
    // Load user preferences from backend or localStorage
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      this.preferences = { ...this.preferences, ...JSON.parse(savedPreferences) };
    }
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  changePhoto(): void {
    const photoInput = document.querySelector('#photoInput') as HTMLInputElement;
    if (photoInput) {
      photoInput.click();
    }
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // In a real app, upload to server
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentUser.avatar = e.target.result;
        this.showSnackBar('Profile photo updated!', 'success');
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.isUpdatingProfile = true;
      
      const updatedData = this.profileForm.value;
      
      // Mock API call - replace with actual backend call
      this.authService.updateProfile(updatedData).subscribe({
        next: (response) => {
          this.showSnackBar('Profile updated successfully!', 'success');
          this.isUpdatingProfile = false;
          
          // Update current user data
          this.currentUser = { ...this.currentUser, ...updatedData };
          this.authService.updateCurrentUser(this.currentUser);
        },
        error: (error) => {
          console.error('Profile update error:', error);
          this.showSnackBar('Failed to update profile. Please try again.', 'error');
          this.isUpdatingProfile = false;
        }
      });
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.isChangingPassword = true;
      
      const passwordData = {
        currentPassword: this.passwordForm.get('currentPassword')?.value,
        newPassword: this.passwordForm.get('newPassword')?.value
      };
      
      // Mock API call - replace with actual backend call
      this.authService.changePassword(passwordData).subscribe({
        next: (response) => {
          this.showSnackBar('Password changed successfully!', 'success');
          this.passwordForm.reset();
          this.isChangingPassword = false;
        },
        error: (error) => {
          console.error('Password change error:', error);
          this.showSnackBar('Failed to change password. Please check your current password.', 'error');
          this.isChangingPassword = false;
        }
      });
    }
  }

  savePreferences(): void {
    this.isSavingPreferences = true;
    
    // Save to localStorage and backend
    localStorage.setItem('userPreferences', JSON.stringify(this.preferences));
    
    // Mock API call - replace with actual backend call
    setTimeout(() => {
      this.showSnackBar('Preferences saved successfully!', 'success');
      this.isSavingPreferences = false;
    }, 1000);
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [`snackbar-${type}`]
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard1/user/overview']);
  }
}