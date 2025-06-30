import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../services/auth.service';
import { BookingService } from '../../../services/booking.service';
import { BookingCampDTO, BookingSanatorium, DocumentStatus } from '../../../models/booking.model';

interface BookingWithType {
  type: 'camp' | 'sanatorium';
  data: BookingCampDTO | BookingSanatorium;
  displayName: string;
  statusColor: string;
  canCancel: boolean;
  canEdit: boolean;
}

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="bookings-container">
      <div class="header">
        <button class="back-btn" (click)="goBack()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="header-content">
          <h1><i class="fas fa-calendar-check"></i> My Bookings</h1>
          <p>Manage your camp and sanatorium reservations</p>
        </div>
        <button mat-raised-button color="primary" (click)="createNewBooking()" class="create-btn">
          <i class="fas fa-plus"></i>
          New Booking
        </button>
      </div>

      <!-- Booking Tabs -->
      <mat-tab-group class="booking-tabs" (selectedTabChange)="onTabChange($event)">
        <mat-tab label="All Bookings">
          <div class="tab-content">
            <div class="bookings-grid" *ngIf="allBookings.length > 0; else noBookings">
              <div *ngFor="let booking of allBookings" class="booking-card">
                <div class="booking-header">
                  <div class="booking-type">
                    <i class="{{getBookingIcon(booking.type)}}"></i>
                    <span>{{booking.type | titlecase}}</span>
                  </div>
                  <mat-chip [style.background-color]="booking.statusColor" class="status-chip">
                    {{getStatusText(getBookingStatus(booking))}}
                  </mat-chip>
                </div>

                <div class="booking-content">
                  <h3>{{booking.displayName}}</h3>
                  
                  <!-- Camp Booking Details -->
                  <div *ngIf="booking.type === 'camp'" class="booking-details">
                    <div class="detail-item">
                      <i class="fas fa-child"></i>
                      <span>Child: {{getCampChildName(booking.data)}}</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-calendar"></i>
                      <span>Birth Date: {{formatDate(getCampBirthDate(booking.data))}}</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-phone"></i>
                      <span>Guardian: {{getCampGuardianPhone(booking.data)}}</span>
                    </div>
                  </div>

                  <!-- Sanatorium Booking Details -->
                  <div *ngIf="booking.type === 'sanatorium'" class="booking-details">
                    <div class="detail-item">
                      <i class="fas fa-calendar-alt"></i>
                      <span>{{formatDate(getSanatoriumStartDate(booking.data))}} - {{formatDate(getSanatoriumEndDate(booking.data))}}</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-clock"></i>
                      <span>Duration: {{getSanatoriumDuration(booking.data)}} days</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-money-bill"></i>
                      <span>Total: {{formatPrice(getSanatoriumPrice(booking.data))}} UZS</span>
                    </div>
                  </div>
                </div>

                <div class="booking-actions">
                  <button mat-button (click)="viewBooking(booking)" class="view-btn">
                    <i class="fas fa-eye"></i>
                    View Details
                  </button>
                  
                  <button mat-button [disabled]="!booking.canEdit" 
                          (click)="editBooking(booking)" class="edit-btn">
                    <i class="fas fa-edit"></i>
                    Edit
                  </button>
                  
                  <button mat-button [disabled]="!booking.canCancel" 
                          (click)="cancelBooking(booking)" class="cancel-btn">
                    <i class="fas fa-times"></i>
                    Cancel
                  </button>

                  <button mat-button (click)="addReview(booking)" 
                          *ngIf="canAddReview(booking)" class="review-btn">
                    <i class="fas fa-star"></i>
                    Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Camp Bookings">
          <div class="tab-content">
            <div class="bookings-grid" *ngIf="campBookings.length > 0; else noCampBookings">
              <div *ngFor="let booking of campBookings" class="booking-card camp-booking">
                <!-- Same structure as above but only for camp bookings -->
                <div class="booking-header">
                  <div class="booking-type">
                    <i class="fas fa-campground"></i>
                    <span>Camp</span>
                  </div>
                  <mat-chip [style.background-color]="getStatusColor(booking.documentStatus || DocumentStatus.PENDING)" class="status-chip">
                    {{getStatusText(booking.documentStatus || DocumentStatus.PENDING)}}
                  </mat-chip>
                </div>

                <div class="booking-content">
                  <h3>{{booking.firstName}} {{booking.lastName}}</h3>
                  <div class="booking-details">
                    <div class="detail-item">
                      <i class="fas fa-calendar"></i>
                      <span>Birth: {{formatDate(booking.birthDate)}}</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-id-card"></i>
                      <span>Document: {{booking.documentNumber}}</span>
                    </div>
                  </div>
                </div>

                <div class="booking-actions">
                  <button mat-button (click)="viewCampBooking(booking)" class="view-btn">
                    <i class="fas fa-eye"></i>
                    View Details
                  </button>
                  <button mat-button (click)="editCampBooking(booking)" class="edit-btn">
                    <i class="fas fa-edit"></i>
                    Edit
                  </button>
                </div>
              </div>
            </div>
            <ng-template #noCampBookings>
              <div class="no-bookings">
                <i class="fas fa-campground"></i>
                <h3>No Camp Bookings</h3>
                <p>You haven't made any camp bookings yet.</p>
                <button mat-raised-button color="primary" (click)="bookCamp()">
                  <i class="fas fa-plus"></i>
                  Book a Camp
                </button>
              </div>
            </ng-template>
          </div>
        </mat-tab>

        <mat-tab label="Sanatorium Bookings">
          <div class="tab-content">
            <div class="bookings-grid" *ngIf="sanatoriumBookings.length > 0; else noSanatoriumBookings">
              <div *ngFor="let booking of sanatoriumBookings" class="booking-card sanatorium-booking">
                <!-- Same structure for sanatorium bookings -->
                <div class="booking-header">
                  <div class="booking-type">
                    <i class="fas fa-hospital"></i>
                    <span>Sanatorium</span>
                  </div>
                  <mat-chip [style.background-color]="getStatusColor(booking.status)" class="status-chip">
                    {{getStatusText(booking.status)}}
                  </mat-chip>
                </div>

                <div class="booking-content">
                  <h3>Sanatorium Booking #{{booking.id}}</h3>
                  <div class="booking-details">
                    <div class="detail-item">
                      <i class="fas fa-calendar-alt"></i>
                      <span>{{formatDate(booking.startDate)}} - {{formatDate(booking.endDate)}}</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-money-bill"></i>
                      <span>{{formatPrice(booking.totalPrice)}} UZS</span>
                    </div>
                  </div>
                </div>

                <div class="booking-actions">
                  <button mat-button (click)="viewSanatoriumBooking(booking)" class="view-btn">
                    <i class="fas fa-eye"></i>
                    View Details
                  </button>
                  <button mat-button (click)="editSanatoriumBooking(booking)" class="edit-btn">
                    <i class="fas fa-edit"></i>
                    Edit
                  </button>
                </div>
              </div>
            </div>
            <ng-template #noSanatoriumBookings>
              <div class="no-bookings">
                <i class="fas fa-hospital"></i>
                <h3>No Sanatorium Bookings</h3>
                <p>You haven't made any sanatorium bookings yet.</p>
                <button mat-raised-button color="primary" (click)="bookSanatorium()">
                  <i class="fas fa-plus"></i>
                  Book a Sanatorium
                </button>
              </div>
            </ng-template>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- No Bookings State -->
      <ng-template #noBookings>
        <div class="no-bookings-state">
          <div class="no-bookings-icon">
            <i class="fas fa-calendar-times"></i>
          </div>
          <h2>No Bookings Yet</h2>
          <p>Start your journey by creating your first booking!</p>
          <div class="action-buttons">
            <button mat-raised-button color="primary" (click)="bookCamp()" class="camp-btn">
              <i class="fas fa-campground"></i>
              Book Camp
            </button>
            <button mat-raised-button color="accent" (click)="bookSanatorium()" class="sanatorium-btn">
              <i class="fas fa-hospital"></i>
              Book Sanatorium
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {
  allBookings: BookingWithType[] = [];
  campBookings: BookingCampDTO[] = [];
  sanatoriumBookings: BookingSanatorium[] = [];
  currentUser: any;
  DocumentStatus = DocumentStatus; // Make enum available in template

  constructor(
    private router: Router,
    private authService: AuthService,
    private bookingService: BookingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadBookings();
    }
  }

  private loadBookings(): void {
    // Load camp bookings
    this.bookingService.getCampBookings({ userId: this.currentUser.userId }).subscribe({
      next: (response) => {
        this.campBookings = response?.content || response || [];
        this.updateAllBookings();
      },
      error: (err) => console.error('Error loading camp bookings:', err)
    });

    // Load sanatorium bookings
    this.bookingService.getSanatoriumBookings({ userId: this.currentUser.userId }).subscribe({
      next: (response) => {
        this.sanatoriumBookings = response?.content || response || [];
        this.updateAllBookings();
      },
      error: (err) => console.error('Error loading sanatorium bookings:', err)
    });
  }

  private updateAllBookings(): void {
    this.allBookings = [
      ...this.campBookings.map(booking => ({
        type: 'camp' as const,
        data: booking,
        displayName: `${booking.firstName} ${booking.lastName}`,
        statusColor: this.getStatusColor(booking.documentStatus || DocumentStatus.PENDING),
        canCancel: this.canCancelBooking(booking.documentStatus || DocumentStatus.PENDING),
        canEdit: this.canEditBooking(booking.documentStatus || DocumentStatus.PENDING)
      })),
      ...this.sanatoriumBookings.map(booking => ({
        type: 'sanatorium' as const,
        data: booking,
        displayName: `Sanatorium Booking #${booking.id}`,
        statusColor: this.getStatusColor(booking.status || DocumentStatus.PENDING),
        canCancel: this.canCancelBooking(booking.status || DocumentStatus.PENDING),
        canEdit: this.canEditBooking(booking.status || DocumentStatus.PENDING)
      }))
    ];
  }

  getBookingIcon(type: string): string {
    return type === 'camp' ? 'fas fa-campground' : 'fas fa-hospital';
  }

  getStatusColor(status: DocumentStatus): string {
    switch (status) {
      case DocumentStatus.PENDING: return '#FFC107';
      case DocumentStatus.APPROVED: return '#4CAF50';
      case DocumentStatus.REJECTED: return '#f44336';
      default: return '#6c757d';
    }
  }

  getStatusText(status: DocumentStatus): string {
    switch (status) {
      case DocumentStatus.PENDING: return 'Pending';
      case DocumentStatus.APPROVED: return 'Approved';
      case DocumentStatus.REJECTED: return 'Rejected';
      default: return 'Unknown';
    }
  }

  canCancelBooking(status: DocumentStatus): boolean {
    return status === DocumentStatus.PENDING;
  }

  canEditBooking(status: DocumentStatus): boolean {
    return status === DocumentStatus.PENDING || status === DocumentStatus.REJECTED;
  }

  canAddReview(booking: BookingWithType): boolean {
    const status = this.getBookingStatus(booking);
    return status === DocumentStatus.APPROVED;
  }

  // Helper methods for template
  getBookingStatus(booking: BookingWithType): DocumentStatus {
    if (booking.type === 'camp') {
      return (booking.data as BookingCampDTO).documentStatus || DocumentStatus.PENDING;
    } else {
      return (booking.data as BookingSanatorium).status || DocumentStatus.PENDING;
    }
  }

  getCampChildName(data: BookingCampDTO | BookingSanatorium): string {
    if ('firstName' in data) {
      return `${(data as BookingCampDTO).firstName} ${(data as BookingCampDTO).lastName}`;
    }
    return '';
  }

  getCampBirthDate(data: BookingCampDTO | BookingSanatorium): string {
    if ('birthDate' in data) {
      return (data as BookingCampDTO).birthDate;
    }
    return '';
  }

  getCampGuardianPhone(data: BookingCampDTO | BookingSanatorium): string {
    if ('guardianPhone' in data) {
      return (data as BookingCampDTO).guardianPhone;
    }
    return '';
  }

  getSanatoriumStartDate(data: BookingCampDTO | BookingSanatorium): string {
    if ('startDate' in data) {
      return (data as BookingSanatorium).startDate;
    }
    return '';
  }

  getSanatoriumEndDate(data: BookingCampDTO | BookingSanatorium): string {
    if ('endDate' in data) {
      return (data as BookingSanatorium).endDate;
    }
    return '';
  }

  getSanatoriumDuration(data: BookingCampDTO | BookingSanatorium): number {
    if ('durationDays' in data) {
      return (data as BookingSanatorium).durationDays;
    }
    return 0;
  }

  getSanatoriumPrice(data: BookingCampDTO | BookingSanatorium): number {
    if ('totalPrice' in data) {
      return (data as BookingSanatorium).totalPrice;
    }
    return 0;
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  formatPrice(price: number): string {
    if (!price) return '0';
    return price.toLocaleString();
  }

  onTabChange(event: any): void {
    // Handle tab change if needed
  }

  goBack(): void {
    this.router.navigate(['/dashboard1/user/overview']);
  }

  createNewBooking(): void {
    // Navigate to booking creation page
    this.router.navigate(['/dashboard1/user/overview']);
  }

  bookCamp(): void {
    this.router.navigate(['/dashboard1/user/book-camp']);
  }

  bookSanatorium(): void {
    this.router.navigate(['/dashboard1/user/book-sanatorium']);
  }

  viewBooking(booking: BookingWithType): void {
    // Implement view booking details
    this.showSnackBar('View booking details - feature coming soon', 'info');
  }

  viewCampBooking(booking: BookingCampDTO): void {
    // Implement view camp booking details
    this.showSnackBar('View camp booking details - feature coming soon', 'info');
  }

  viewSanatoriumBooking(booking: BookingSanatorium): void {
    // Implement view sanatorium booking details
    this.showSnackBar('View sanatorium booking details - feature coming soon', 'info');
  }

  editBooking(booking: BookingWithType): void {
    if (booking.type === 'camp') {
      this.editCampBooking(booking.data as BookingCampDTO);
    } else {
      this.editSanatoriumBooking(booking.data as BookingSanatorium);
    }
  }

  editCampBooking(booking: BookingCampDTO): void {
    // Pre-fill data and navigate to edit form
    this.bookingService.setPrefilledData({
      type: 'camp',
      isEdit: true,
      bookingId: booking.id,
      childData: {
        firstName: booking.firstName,
        lastName: booking.lastName,
        birthDate: booking.birthDate,
        gender: booking.gender,
        documentNumber: booking.documentNumber,
        address: booking.address
      },
      guardianData: {
        guardianFirstName: booking.guardianFirstName,
        guardianLastName: booking.guardianLastName,
        guardianPhone: booking.guardianPhone,
        guardianDocument: booking.guardianDocument,
        guardianJob: booking.guardianJob
      }
    });
    this.router.navigate(['/dashboard1/user/book-camp']);
  }

  editSanatoriumBooking(booking: BookingSanatorium): void {
    // Pre-fill data and navigate to edit form
    this.bookingService.setPrefilledData({
      type: 'sanatorium',
      isEdit: true,
      bookingId: booking.id,
      bookingData: {
        startDate: booking.startDate,
        endDate: booking.endDate,
        durationDays: booking.durationDays,
        totalPrice: booking.totalPrice
      }
    });
    this.router.navigate(['/dashboard1/user/book-sanatorium']);
  }

  cancelBooking(booking: BookingWithType): void {
    if (confirm('Are you sure you want to cancel this booking?')) {
      const bookingId = booking.data.id!;
      const type = booking.type;
      
      this.bookingService.updateBookingStatus(bookingId, DocumentStatus.REJECTED, type).subscribe({
        next: () => {
          this.showSnackBar('Booking cancelled successfully', 'success');
          this.loadBookings();
        },
        error: (err) => {
          console.error('Error cancelling booking:', err);
          this.showSnackBar('Failed to cancel booking', 'error');
        }
      });
    }
  }

  addReview(booking: BookingWithType): void {
    // Navigate to review page or open review dialog
    this.router.navigate(['/dashboard1/user/reviews'], { 
      queryParams: { bookingId: booking.data.id, type: booking.type } 
    });
  }

  private showSnackBar(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: [`snackbar-${type}`]
    });
  }
}