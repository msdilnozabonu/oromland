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
import { BookingSanatorium, DocumentStatus } from '../../../models/booking.model';

@Component({
  selector: 'app-book-sanatorium',
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
    <div class="book-sanatorium-container">
      <div class="header">
        <button class="back-btn" (click)="goBack()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h1>Book Sanatorium</h1>
      </div>

      <div class="booking-form-card">
        <mat-horizontal-stepper #stepper>
          <!-- Step 1: Booking Details -->
          <mat-step [stepControl]="bookingForm" label="Booking Details">
            <form [formGroup]="bookingForm" class="step-form">
              <div class="form-section">
                <h3><i class="fas fa-calendar-alt"></i> Booking Information</h3>
                
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Start Date</mat-label>
                    <input matInput [matDatepicker]="startPicker" formControlName="startDate"
                           [min]="minDate">
                    <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                    <mat-datepicker #startPicker></mat-datepicker>
                    <mat-error *ngIf="bookingForm.get('startDate')?.hasError('required')">
                      Start date is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>End Date</mat-label>
                    <input matInput [matDatepicker]="endPicker" formControlName="endDate"
                           [min]="bookingForm.get('startDate')?.value">
                    <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                    <mat-datepicker #endPicker></mat-datepicker>
                    <mat-error *ngIf="bookingForm.get('endDate')?.hasError('required')">
                      End date is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Duration (Days)</mat-label>
                    <input matInput type="number" formControlName="durationDays" 
                           placeholder="Enter duration" [readonly]="true">
                    <mat-hint>Calculated automatically</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Total Price (UZS)</mat-label>
                    <input matInput type="number" formControlName="totalPrice" 
                           placeholder="Enter total price">
                    <mat-error *ngIf="bookingForm.get('totalPrice')?.hasError('required')">
                      Total price is required
                    </mat-error>
                    <mat-error *ngIf="bookingForm.get('totalPrice')?.hasError('min')">
                      Price must be greater than 0
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="pricing-info">
                  <div class="pricing-card">
                    <h4><i class="fas fa-calculator"></i> Pricing Breakdown</h4>
                    <div class="pricing-row">
                      <span>Daily Rate:</span>
                      <span class="price">{{dailyRate | currency:'UZS':'symbol':'1.0-0'}}</span>
                    </div>
                    <div class="pricing-row">
                      <span>Duration:</span>
                      <span>{{bookingForm.get('durationDays')?.value || 0}} days</span>
                    </div>
                    <div class="pricing-row total">
                      <span>Total:</span>
                      <span class="price">{{bookingForm.get('totalPrice')?.value || 0 | currency:'UZS':'symbol':'1.0-0'}}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="step-actions">
                <button mat-raised-button color="primary" matStepperNext 
                        [disabled]="!bookingForm.valid" class="next-btn">
                  Next
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 2: Documents -->
          <mat-step label="Required Documents">
            <div class="step-form">
              <div class="form-section">
                <h3><i class="fas fa-file-medical-alt"></i> Required Documents</h3>
                
                <div class="document-upload-grid">
                  <div class="document-item">
                    <div class="document-icon">
                      <i class="fas fa-id-card"></i>
                    </div>
                    <div class="document-info">
                      <h4>Passport Copy</h4>
                      <p>Copy of your passport</p>
                      <span class="required">Required</span>
                    </div>
                    <input type="file" #passportFile (change)="onFileSelected('passportCopy', $event)" 
                           accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                    <button mat-raised-button color="primary" (click)="passportFile.click()" 
                            class="upload-btn">
                      <i class="fas fa-upload"></i> Upload
                    </button>
                  </div>

                  <div class="document-item">
                    <div class="document-icon">
                      <i class="fas fa-file-medical"></i>
                    </div>
                    <div class="document-info">
                      <h4>Medical Form 086</h4>
                      <p>Medical certificate form 086</p>
                      <span class="required">Required</span>
                    </div>
                    <input type="file" #medicalFile (change)="onFileSelected('medicalForm086', $event)" 
                           accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                    <button mat-raised-button color="primary" (click)="medicalFile.click()" 
                            class="upload-btn">
                      <i class="fas fa-upload"></i> Upload
                    </button>
                  </div>

                  <div class="document-item">
                    <div class="document-icon">
                      <i class="fas fa-syringe"></i>
                    </div>
                    <div class="document-info">
                      <h4>Vaccination Card</h4>
                      <p>Current vaccination certificate</p>
                      <span class="required">Required</span>
                    </div>
                    <input type="file" #vaccinationFile (change)="onFileSelected('vaccinationCard', $event)" 
                           accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                    <button mat-raised-button color="primary" (click)="vaccinationFile.click()" 
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
                      <p>Recent passport-size photo</p>
                      <span class="required">Required</span>
                    </div>
                    <input type="file" #photoFile (change)="onFileSelected('photo', $event)" 
                           accept=".jpg,.jpeg,.png" style="display: none;">
                    <button mat-raised-button color="primary" (click)="photoFile.click()" 
                            class="upload-btn">
                      <i class="fas fa-upload"></i> Upload
                    </button>
                  </div>

                  <div class="document-item optional">
                    <div class="document-icon">
                      <i class="fas fa-briefcase"></i>
                    </div>
                    <div class="document-info">
                      <h4>Workplace Document</h4>
                      <p>Document from workplace (if available)</p>
                      <span class="optional">Optional</span>
                    </div>
                    <input type="file" #workplaceFile (change)="onFileSelected('givenDocumentByWorkplace', $event)" 
                           accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                    <button mat-raised-button color="accent" (click)="workplaceFile.click()" 
                            class="upload-btn">
                      <i class="fas fa-upload"></i> Upload
                    </button>
                  </div>
                </div>

                <div class="uploaded-files" *ngIf="getUploadedFilesList().length > 0">
                  <h4><i class="fas fa-check-circle"></i> Uploaded Files</h4>
                  <div class="file-list">
                    <div *ngFor="let file of getUploadedFilesList()" class="file-item">
                      <i class="fas fa-file"></i>
                      <span>{{file.name}}</span>
                      <span class="file-size">{{formatFileSize(file.size)}}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious class="back-btn-step">Back</button>
                <button mat-raised-button color="primary" (click)="submitBooking()" 
                        [disabled]="isSubmitting || !isRequiredDocumentsUploaded()" class="submit-btn">
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
  styleUrls: ['./book-sanatorium.component.scss']
})
export class BookSanatoriumComponent implements OnInit {
  bookingForm: FormGroup;
  isSubmitting = false;
  uploadedFiles: { [key: string]: File } = {};
  minDate = new Date();
  dailyRate = 500000; // Default daily rate in UZS

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bookingService: BookingService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.bookingForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      durationDays: [0],
      totalPrice: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.setupFormSubscriptions();
    this.checkForPrefilledData();
  }

  private setupFormSubscriptions(): void {
    // Calculate duration and price when dates change
    this.bookingForm.get('startDate')?.valueChanges.subscribe(() => {
      this.calculateDurationAndPrice();
    });

    this.bookingForm.get('endDate')?.valueChanges.subscribe(() => {
      this.calculateDurationAndPrice();
    });
  }

  private calculateDurationAndPrice(): void {
    const startDate = this.bookingForm.get('startDate')?.value;
    const endDate = this.bookingForm.get('endDate')?.value;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const totalPrice = diffDays * this.dailyRate;
      
      this.bookingForm.patchValue({
        durationDays: diffDays,
        totalPrice: totalPrice
      });
    }
  }

  private checkForPrefilledData(): void {
    const prefilledData = this.bookingService.getPrefilledData();
    if (prefilledData && prefilledData.type === 'sanatorium') {
      this.bookingForm.patchValue(prefilledData.bookingData || {});
      if (prefilledData.dailyRate) {
        this.dailyRate = prefilledData.dailyRate;
      }
      this.showSnackBar('Form pre-filled with data from selected sanatorium', 'success');
    }
  }

  onFileSelected(type: string, event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showSnackBar('File size must be less than 5MB', 'error');
        return;
      }

      this.uploadedFiles[type] = file;
      this.showSnackBar(`${this.getDocumentTitle(type)} file selected: ${file.name}`, 'success');
    }
  }

  getUploadedFilesList(): File[] {
    return Object.values(this.uploadedFiles);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isRequiredDocumentsUploaded(): boolean {
    const requiredDocs = ['passportCopy', 'medicalForm086', 'vaccinationCard', 'photo'];
    return requiredDocs.every(doc => this.uploadedFiles[doc]);
  }

  private getDocumentTitle(type: string): string {
    const titles: { [key: string]: string } = {
      passportCopy: 'Passport Copy',
      medicalForm086: 'Medical Form 086',
      vaccinationCard: 'Vaccination Card',
      photo: 'Photo',
      givenDocumentByWorkplace: 'Workplace Document'
    };
    return titles[type] || type;
  }

  submitBooking(): void {
    if (!this.bookingForm.valid) {
      this.showSnackBar('Please fill all required fields', 'error');
      return;
    }

    if (!this.isRequiredDocumentsUploaded()) {
      this.showSnackBar('Please upload all required documents', 'error');
      return;
    }

    this.isSubmitting = true;

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.showSnackBar('User not authenticated', 'error');
      this.isSubmitting = false;
      return;
    }

    const bookingData: BookingSanatorium = {
      ...this.bookingForm.value,
      userId: user.userId,
      startDate: this.formatDate(this.bookingForm.value.startDate),
      endDate: this.formatDate(this.bookingForm.value.endDate),
      status: DocumentStatus.PENDING
    };

    this.bookingService.createSanatoriumBooking(bookingData).subscribe({
      next: (response) => {
        this.showSnackBar('Sanatorium booking submitted successfully!', 'success');
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