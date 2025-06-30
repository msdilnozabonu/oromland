import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { BookingService } from '../../../services/booking.service';
import { NavigationService } from '../../../services/navigation.service';
import { AuthService } from '../../../services/auth.service';
import { BookingCampDTO, DocumentStatus } from '../../../models/booking.model';

@Component({
  selector: 'app-book-camp',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatStepperModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="book-camp-container">
      <div class="header">
        <button class="back-btn" (click)="goBack()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h1>Book Camp</h1>
      </div>

      <div class="booking-form-card">
        <mat-horizontal-stepper #stepper>
          <!-- Step 1: Child Information -->
          <mat-step [stepControl]="childForm" label="Child Information">
            <form [formGroup]="childForm" class="step-form">
              <div class="form-section">
                <h3><i class="fas fa-child"></i> Child Information</h3>
                
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>First Name</mat-label>
                    <input matInput formControlName="firstName" placeholder="Enter first name">
                    <mat-error *ngIf="childForm.get('firstName')?.hasError('required')">
                      First name is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Last Name</mat-label>
                    <input matInput formControlName="lastName" placeholder="Enter last name">
                    <mat-error *ngIf="childForm.get('lastName')?.hasError('required')">
                      Last name is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Birth Date</mat-label>
                    <input matInput [matDatepicker]="birthPicker" formControlName="birthDate">
                    <mat-datepicker-toggle matSuffix [for]="birthPicker"></mat-datepicker-toggle>
                    <mat-datepicker #birthPicker></mat-datepicker>
                    <mat-error *ngIf="childForm.get('birthDate')?.hasError('required')">
                      Birth date is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Gender</mat-label>
                    <mat-select formControlName="gender">
                      <mat-option value="MALE">Male</mat-option>
                      <mat-option value="FEMALE">Female</mat-option>
                    </mat-select>
                    <mat-error *ngIf="childForm.get('gender')?.hasError('required')">
                      Gender is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Document Number</mat-label>
                    <input matInput formControlName="documentNumber" placeholder="Enter document number">
                    <mat-error *ngIf="childForm.get('documentNumber')?.hasError('required')">
                      Document number is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Address</mat-label>
                    <textarea matInput formControlName="address" placeholder="Enter address" rows="3"></textarea>
                    <mat-error *ngIf="childForm.get('address')?.hasError('required')">
                      Address is required
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>

              <div class="step-actions">
                <button mat-raised-button color="primary" matStepperNext 
                        [disabled]="!childForm.valid" class="next-btn">
                  Next
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 2: Guardian Information -->
          <mat-step [stepControl]="guardianForm" label="Guardian Information">
            <form [formGroup]="guardianForm" class="step-form">
              <div class="form-section">
                <h3><i class="fas fa-user-friends"></i> Guardian Information</h3>
                
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Guardian First Name</mat-label>
                    <input matInput formControlName="guardianFirstName" placeholder="Enter guardian first name">
                    <mat-error *ngIf="guardianForm.get('guardianFirstName')?.hasError('required')">
                      Guardian first name is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Guardian Last Name</mat-label>
                    <input matInput formControlName="guardianLastName" placeholder="Enter guardian last name">
                    <mat-error *ngIf="guardianForm.get('guardianLastName')?.hasError('required')">
                      Guardian last name is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Guardian Phone</mat-label>
                    <input matInput formControlName="guardianPhone" placeholder="+998 90 123 45 67">
                    <mat-error *ngIf="guardianForm.get('guardianPhone')?.hasError('required')">
                      Guardian phone is required
                    </mat-error>
                    <mat-error *ngIf="guardianForm.get('guardianPhone')?.hasError('pattern')">
                      Please enter a valid phone number
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Guardian Document</mat-label>
                    <input matInput formControlName="guardianDocument" placeholder="Passport series and number">
                    <mat-error *ngIf="guardianForm.get('guardianDocument')?.hasError('required')">
                      Guardian document is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Guardian Job</mat-label>
                    <input matInput formControlName="guardianJob" placeholder="Enter guardian's job">
                    <mat-error *ngIf="guardianForm.get('guardianJob')?.hasError('required')">
                      Guardian job is required
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious class="back-btn-step">Back</button>
                <button mat-raised-button color="primary" matStepperNext 
                        [disabled]="!guardianForm.valid" class="next-btn">
                  Next
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 3: Documents -->
          <mat-step label="Documents">
            <div class="step-form">
              <div class="form-section">
                <h3><i class="fas fa-file-medical"></i> Required Documents</h3>
                
                <div class="document-upload-grid">
                  <div class="document-item">
                    <div class="document-icon">
                      <i class="fas fa-file-medical"></i>
                    </div>
                    <div class="document-info">
                      <h4>Health Note</h4>
                      <p>Medical certificate from doctor</p>
                    </div>
                    <input type="file" #healthNoteFile (change)="onFileSelected('healthNote', $event)" 
                           accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                    <button mat-raised-button color="primary" (click)="healthNoteFile.click()" 
                            class="upload-btn">
                      <i class="fas fa-upload"></i> Upload
                    </button>
                  </div>

                  <div class="document-item">
                    <div class="document-icon">
                      <i class="fas fa-certificate"></i>
                    </div>
                    <div class="document-info">
                      <h4>Birth Certificate</h4>
                      <p>Child's birth certificate</p>
                    </div>
                    <input type="file" #birthCertFile (change)="onFileSelected('birthCertificate', $event)" 
                           accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                    <button mat-raised-button color="primary" (click)="birthCertFile.click()" 
                            class="upload-btn">
                      <i class="fas fa-upload"></i> Upload
                    </button>
                  </div>

                  <div class="document-item">
                    <div class="document-icon">
                      <i class="fas fa-camera"></i>
                    </div>
                    <div class="document-info">
                      <h4>Photo</h4>
                      <p>Child's recent photo</p>
                    </div>
                    <input type="file" #photoFile (change)="onFileSelected('photo', $event)" 
                           accept=".jpg,.jpeg,.png" style="display: none;">
                    <button mat-raised-button color="primary" (click)="photoFile.click()" 
                            class="upload-btn">
                      <i class="fas fa-upload"></i> Upload
                    </button>
                  </div>

                  <div class="document-item">
                    <div class="document-icon">
                      <i class="fas fa-id-card"></i>
                    </div>
                    <div class="document-info">
                      <h4>Parent Passport</h4>
                      <p>Guardian's passport copy</p>
                    </div>
                    <input type="file" #parentPassportFile (change)="onFileSelected('parentPassport', $event)" 
                           accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                    <button mat-raised-button color="primary" (click)="parentPassportFile.click()" 
                            class="upload-btn">
                      <i class="fas fa-upload"></i> Upload
                    </button>
                  </div>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious class="back-btn-step">Back</button>
                <button mat-raised-button color="primary" (click)="submitBooking()" 
                        [disabled]="isSubmitting" class="submit-btn">
                  <i class="fas fa-check" *ngIf="!isSubmitting"></i>
                  <i class="fas fa-spinner fa-spin" *ngIf="isSubmitting"></i>
                  {{ isSubmitting ? 'Submitting...' : 'Submit Booking' }}
                </button>
              </div>
            </div>
          </mat-step>
        </mat-horizontal-stepper>
      </div>
    </div>
  `,
  styleUrls: ['./book-camp.component.scss']
})
export class BookCampComponent implements OnInit {
  childForm: FormGroup;
  guardianForm: FormGroup;
  isSubmitting = false;
  uploadedFiles: { [key: string]: File } = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bookingService: BookingService,
    private navigationService: NavigationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.childForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthDate: ['', Validators.required],
      gender: ['', Validators.required],
      documentNumber: ['', Validators.required],
      address: ['', Validators.required]
    });

    this.guardianForm = this.fb.group({
      guardianFirstName: ['', Validators.required],
      guardianLastName: ['', Validators.required],
      guardianPhone: ['', [Validators.required, Validators.pattern(/^\+998\d{9}$/)]],
      guardianDocument: ['', Validators.required],
      guardianJob: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.checkForPrefilledData();
  }

  private checkForPrefilledData(): void {
    const selectedPlace = this.bookingService.getSelectedPlace();
    if (selectedPlace && selectedPlace.type === 'camp') {
      // Show success message that camp has been pre-selected
      this.showSnackBar(`Camp "${selectedPlace.name}" has been pre-selected for you!`, 'success');
      
      // You can use this data for displaying camp info in the form
      console.log('Pre-selected camp:', selectedPlace);
    }
  }

  onFileSelected(type: string, event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFiles[type] = file;
      this.showSnackBar(`${type} file selected: ${file.name}`, 'success');
    }
  }

  submitBooking(): void {
    if (!this.childForm.valid || !this.guardianForm.valid) {
      this.showSnackBar('Please fill all required fields', 'error');
      return;
    }

    this.isSubmitting = true;

    const bookingData: BookingCampDTO = {
      ...this.childForm.value,
      ...this.guardianForm.value,
      birthDate: this.formatDate(this.childForm.value.birthDate),
      documentStatus: DocumentStatus.PENDING
    };

    this.bookingService.createCampBooking(bookingData).subscribe({
      next: (response) => {
        this.showSnackBar('Camp booking submitted successfully!', 'success');
        this.router.navigate(['/dashboard1/user/overview']);
      },
      error: (error) => {
        console.error('Booking error:', error);
        this.showSnackBar('Failed to submit booking. Please try again.', 'error');
        this.isSubmitting = false;
      }
    });
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: [`snackbar-${type}`]
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard1/user/overview']);
  }
}