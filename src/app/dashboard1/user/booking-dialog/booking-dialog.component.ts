import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';

interface BookingData {
  placeId?: string;
  placeName?: string;
  placeType?: 'camp' | 'sanatorium';
}

@Component({
  selector: 'app-booking-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatStepperModule,
    ReactiveFormsModule,
    FormsModule
  ],
  template: `
    <div class="booking-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>book_online</mat-icon>
          Book Your Stay
        </h2>
        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <mat-stepper [linear]="true" #stepper>
          <mat-step [stepControl]="bookingForm" label="Booking Details">
            <form [formGroup]="bookingForm" class="booking-form">
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Select Place</mat-label>
                  <mat-select formControlName="placeId" required>
                    <mat-option *ngFor="let place of availablePlaces" [value]="place.id">
                      <div class="place-option">
                        <mat-icon>{{place.type === 'camp' ? 'nature_people' : 'local_hospital'}}</mat-icon>
                        <span>{{place.name}}</span>
                        <span class="place-price">\${{place.price}}/night</span>
                      </div>
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Check-in Date</mat-label>
                  <input matInput [matDatepicker]="checkinPicker" formControlName="checkinDate" required>
                  <mat-datepicker-toggle matSuffix [for]="checkinPicker"></mat-datepicker-toggle>
                  <mat-datepicker #checkinPicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Check-out Date</mat-label>
                  <input matInput [matDatepicker]="checkoutPicker" formControlName="checkoutDate" required>
                  <mat-datepicker-toggle matSuffix [for]="checkoutPicker"></mat-datepicker-toggle>
                  <mat-datepicker #checkoutPicker></mat-datepicker>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Number of Guests</mat-label>
                  <mat-select formControlName="guestCount" required>
                    <mat-option *ngFor="let count of guestCounts" [value]="count">
                      {{count}} {{count === 1 ? 'Guest' : 'Guests'}}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Room Type</mat-label>
                  <mat-select formControlName="roomType" required>
                    <mat-option value="standard">Standard Room</mat-option>
                    <mat-option value="deluxe">Deluxe Room</mat-option>
                    <mat-option value="suite">Suite</mat-option>
                    <mat-option value="family">Family Room</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="step-actions">
                <button mat-raised-button color="primary" matStepperNext 
                        [disabled]="!bookingForm.valid">
                  Next: Guest Details
                </button>
              </div>
            </form>
          </mat-step>

          <mat-step [stepControl]="guestForm" label="Guest Information">
            <form [formGroup]="guestForm" class="guest-form">
              <h3>Primary Guest</h3>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Full Name</mat-label>
                  <input matInput formControlName="primaryName" required>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Relationship</mat-label>
                  <mat-select formControlName="primaryRelation" required>
                    <mat-option value="self">Self</mat-option>
                    <mat-option value="spouse">Spouse/Husband/Wife</mat-option>
                    <mat-option value="parent">Parent</mat-option>
                    <mat-option value="child">Child</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="additional-guests" *ngIf="additionalGuestCount > 0">
                <h4>Additional Guests</h4>
                <div *ngFor="let guest of additionalGuests; let i = index" class="guest-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Guest {{i + 2}} Name</mat-label>
                    <input matInput [(ngModel)]="guest.name" [ngModelOptions]="{standalone: true}">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Relationship</mat-label>
                    <mat-select [(ngModel)]="guest.relation" [ngModelOptions]="{standalone: true}">
                      <mat-option value="spouse">Spouse/Husband/Wife</mat-option>
                      <mat-option value="mother">Mother</mat-option>
                      <mat-option value="father">Father</mat-option>
                      <mat-option value="daughter">Daughter</mat-option>
                      <mat-option value="son">Son</mat-option>
                      <mat-option value="sister">Sister</mat-option>
                      <mat-option value="brother">Brother</mat-option>
                      <mat-option value="friend">Friend</mat-option>
                      <mat-option value="other">Other</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>Back</button>
                <button mat-raised-button color="primary" matStepperNext 
                        [disabled]="!guestForm.valid">
                  Next: Review
                </button>
              </div>
            </form>
          </mat-step>

          <mat-step label="Review & Confirm">
            <div class="booking-summary">
              <h3>Booking Summary</h3>
              
              <div class="summary-card">
                <div class="summary-item">
                  <mat-icon>location_on</mat-icon>
                  <div>
                    <strong>{{getSelectedPlace()?.name}}</strong>
                    <p>{{getSelectedPlace()?.type === 'camp' ? 'Summer Camp' : 'Health Sanatorium'}}</p>
                  </div>
                </div>

                <div class="summary-item">
                  <mat-icon>calendar_today</mat-icon>
                  <div>
                    <strong>{{bookingForm.get('checkinDate')?.value | date}} - {{bookingForm.get('checkoutDate')?.value | date}}</strong>
                    <p>{{calculateNights()}} nights</p>
                  </div>
                </div>

                <div class="summary-item">
                  <mat-icon>people</mat-icon>
                  <div>
                    <strong>{{bookingForm.get('guestCount')?.value}} Guests</strong>
                    <p>{{bookingForm.get('roomType')?.value | titlecase}} Room</p>
                  </div>
                </div>

                <div class="summary-item total">
                  <mat-icon>payment</mat-icon>
                  <div>
                    <strong>Total: \${{calculateTotal()}}</strong>
                    <p>Including taxes and fees</p>
                  </div>
                </div>
              </div>

              <div class="guest-list">
                <h4>Guests</h4>
                <div class="guest-item">
                  <mat-icon>person</mat-icon>
                  <span>{{guestForm.get('primaryName')?.value}} ({{guestForm.get('primaryRelation')?.value | titlecase}})</span>
                </div>
                <div *ngFor="let guest of additionalGuests" class="guest-item">
                  <mat-icon>person_outline</mat-icon>
                  <span>{{guest.name}} ({{guest.relation | titlecase}})</span>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button mat-button matStepperPrevious>Back</button>
              <button mat-raised-button color="primary" (click)="confirmBooking()" 
                      [disabled]="isBooking">
                <mat-icon *ngIf="isBooking">hourglass_empty</mat-icon>
                <mat-icon *ngIf="!isBooking">check</mat-icon>
                {{isBooking ? 'Processing...' : 'Confirm Booking'}}
              </button>
            </div>
          </mat-step>
        </mat-stepper>
      </mat-dialog-content>
    </div>
  `,
  styles: [`
    .booking-dialog {
      width: 100%;
      max-width: 800px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e0e0e0;

      h2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
        color: #4CAF50;
      }
    }

    .dialog-content {
      padding: 2rem;
      max-height: 70vh;
      overflow-y: auto;
    }

    .booking-form, .guest-form {
      padding: 1rem 0;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;

      mat-form-field {
        flex: 1;
      }
    }

    .full-width {
      width: 100%;
    }

    .place-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .place-price {
        margin-left: auto;
        color: #4CAF50;
        font-weight: 600;
      }
    }

    .guest-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .step-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .booking-summary {
      padding: 1rem 0;
    }

    .summary-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1rem 0;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;

      &:last-child {
        margin-bottom: 0;
      }

      &.total {
        border-top: 1px solid #ddd;
        padding-top: 1rem;
        margin-top: 1rem;

        mat-icon {
          color: #4CAF50;
        }

        strong {
          color: #4CAF50;
          font-size: 1.2rem;
        }
      }

      mat-icon {
        color: #666;
      }

      div {
        flex: 1;

        strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
      }
    }

    .guest-list {
      margin-top: 1.5rem;

      h4 {
        margin-bottom: 1rem;
        color: #333;
      }
    }

    .guest-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      mat-icon {
        color: #4CAF50;
      }
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
      }

      .guest-row {
        flex-direction: column;
      }
    }
  `]
})
export class BookingDialogComponent implements OnInit {
  bookingForm: FormGroup;
  guestForm: FormGroup;
  isBooking = false;
  additionalGuestCount = 0;
  additionalGuests: Array<{name: string, relation: string}> = [];

  availablePlaces = [
    { id: '1', name: 'Dustlik Mount Resort', type: 'camp', price: 120 },
    { id: '2', name: 'Charvak Lake Camp', type: 'camp', price: 150 },
    { id: '3', name: 'Wellness Sanatorium Tashkent', type: 'sanatorium', price: 200 },
    { id: '4', name: 'Mineral Springs Resort', type: 'sanatorium', price: 180 }
  ];

  guestCounts = [1, 2, 3, 4, 5, 6, 7, 8];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BookingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BookingData
  ) {
    this.bookingForm = this.fb.group({
      placeId: [data?.placeId || '', Validators.required],
      checkinDate: ['', Validators.required],
      checkoutDate: ['', Validators.required],
      guestCount: [1, Validators.required],
      roomType: ['standard', Validators.required]
    });

    this.guestForm = this.fb.group({
      primaryName: ['', Validators.required],
      primaryRelation: ['self', Validators.required]
    });
  }

  ngOnInit(): void {
    this.bookingForm.get('guestCount')?.valueChanges.subscribe(count => {
      this.additionalGuestCount = count - 1;
      this.additionalGuests = Array(this.additionalGuestCount).fill(null).map(() => ({
        name: '',
        relation: ''
      }));
    });
  }

  getSelectedPlace() {
    const placeId = this.bookingForm.get('placeId')?.value;
    return this.availablePlaces.find(p => p.id === placeId);
  }

  calculateNights(): number {
    const checkin = this.bookingForm.get('checkinDate')?.value;
    const checkout = this.bookingForm.get('checkoutDate')?.value;
    
    if (checkin && checkout) {
      const diffTime = Math.abs(checkout - checkin);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  calculateTotal(): number {
    const place = this.getSelectedPlace();
    const nights = this.calculateNights();
    const guestCount = this.bookingForm.get('guestCount')?.value || 1;
    
    if (place && nights > 0) {
      let basePrice = place.price * nights;
      let roomMultiplier = 1;
      
      switch (this.bookingForm.get('roomType')?.value) {
        case 'deluxe': roomMultiplier = 1.3; break;
        case 'suite': roomMultiplier = 1.8; break;
        case 'family': roomMultiplier = 1.5; break;
      }
      
      return Math.round(basePrice * roomMultiplier * (guestCount > 2 ? 1.2 : 1));
    }
    return 0;
  }

  confirmBooking(): void {
    this.isBooking = true;
    
    setTimeout(() => {
      const bookingData = {
        ...this.bookingForm.value,
        ...this.guestForm.value,
        additionalGuests: this.additionalGuests,
        total: this.calculateTotal(),
        place: this.getSelectedPlace()
      };
      
      this.dialogRef.close(bookingData);
    }, 2000);
  }
}