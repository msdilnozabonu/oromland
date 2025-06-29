import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';
import { FeedbackDialogComponent } from '../feedback-dialog/feedback-dialog.component';
import { ImageCardComponent, ImageCardData } from '../../../shared/components/image-card/image-card.component';
import { ImageService } from '../../../shared/services/image.service';

interface RecentActivity {
  type: 'booking' | 'document' | 'feedback';
  icon: string;
  title: string;
  description: string;
  time: string;
}

@Component({
  selector: 'app-user-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatDialogModule,
    ImageCardComponent
  ],
  template: `
    <div class="user-overview-container">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="welcome-card">
          <div class="welcome-content">
            <div class="welcome-icon">
              <i class="material-icons">waving_hand</i>
            </div>
            <h1 class="welcome-title">Welcome back, {{userName}}!</h1>
            <p class="welcome-subtitle">Ready to explore amazing places?</p>
            
            <!-- Show different content based on user status -->
            <div *ngIf="!hasBookings" class="no-bookings-section">
              <div class="no-bookings-icon">
                <i class="material-icons">explore</i>
              </div>
              <h2 class="no-bookings-title">Let's start your journey!</h2>
              <p class="no-bookings-text">
                Discover amazing camps and sanatoriums. Book your perfect getaway today!
              </p>
              <div class="action-buttons">
                <button mat-raised-button color="primary" class="btn-primary" (click)="openBookingDialog()">
                  <i class="material-icons">book_online</i>
                  Book Now
                </button>
                <button mat-raised-button class="btn-secondary" (click)="goToCamps()">
                  <i class="material-icons">nature_people</i>
                  Explore Places
                </button>
              </div>
            </div>

            <!-- Stats for existing users -->
            <div *ngIf="hasBookings" class="stats-row">
              <div class="stat-card">
                <div class="stat-number">{{totalBookings}}</div>
                <div class="stat-label">Total Bookings</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{activeBookings}}</div>
                <div class="stat-label">Active</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{completedBookings}}</div>
                <div class="stat-label">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Section -->
      <div class="quick-actions-section">
        <h3 class="section-title">Quick Actions</h3>
        <div class="actions-grid">
          <div class="action-card" (click)="openBookingDialog()">
            <div class="action-icon booking">
              <i class="material-icons">book_online</i>
            </div>
            <div class="action-content">
              <h4>Quick Booking</h4>
              <p>Book your stay in just a few clicks</p>
            </div>
            <div class="action-arrow">
              <i class="material-icons">arrow_forward</i>
            </div>
          </div>

          <div class="action-card" (click)="goToCamps()">
            <div class="action-icon camps">
              <i class="material-icons">nature_people</i>
            </div>
            <div class="action-content">
              <h4>Browse Camps</h4>
              <p>Find the perfect camp for your adventure</p>
            </div>
            <div class="action-arrow">
              <i class="material-icons">arrow_forward</i>
            </div>
          </div>

          <div class="action-card" (click)="goToSanatoriums()">
            <div class="action-icon sanatoriums">
              <i class="material-icons">local_hospital</i>
            </div>
            <div class="action-content">
              <h4>Browse Sanatoriums</h4>
              <p>Discover wellness and health retreats</p>
            </div>
            <div class="action-arrow">
              <i class="material-icons">arrow_forward</i>
            </div>
          </div>

          <div class="action-card" (click)="openFeedbackDialog()">
            <div class="action-icon feedback">
              <i class="material-icons">feedback</i>
            </div>
            <div class="action-content">
              <h4>Share Feedback</h4>
              <p>Tell us about your experience</p>
            </div>
            <div class="action-arrow">
              <i class="material-icons">arrow_forward</i>
            </div>
          </div>

          <div class="action-card" (click)="goToBookings()">
            <div class="action-icon bookings">
              <i class="material-icons">calendar_today</i>
            </div>
            <div class="action-content">
              <h4>My Bookings</h4>
              <p>View and manage your reservations</p>
            </div>
            <div class="action-arrow">
              <i class="material-icons">arrow_forward</i>
            </div>
          </div>

          <div class="action-card" (click)="goToProfile()">
            <div class="action-icon profile">
              <i class="material-icons">person</i>
            </div>
            <div class="action-content">
              <h4>My Profile</h4>
              <p>Update your personal information</p>
            </div>
            <div class="action-arrow">
              <i class="material-icons">arrow_forward</i>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity Section (only show if user has bookings) -->
      <div *ngIf="hasBookings" class="recent-activity-section">
        <h3 class="section-title">Recent Activity</h3>
        <div class="activity-list">
          <div *ngFor="let activity of recentActivities" class="activity-item">
            <div class="activity-icon" [ngClass]="'activity-' + activity.type">
              <i class="material-icons">{{activity.icon}}</i>
            </div>
            <div class="activity-content">
              <h4>{{activity.title}}</h4>
              <p>{{activity.description}}</p>
              <span class="activity-time">{{activity.time}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./user-overview.component.scss']
})
export class UserOverviewComponent implements OnInit {
  userName = '';
  hasBookings = false;
  totalBookings = 0;
  activeBookings = 0;
  completedBookings = 0;
  recentActivities: RecentActivity[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.firstName;
      
      // For demo purposes, simulate new user vs existing user
      // In real app, this would come from API
      this.hasBookings = Math.random() > 0.5; // 50% chance of having bookings
      
      if (this.hasBookings) {
        this.totalBookings = Math.floor(Math.random() * 5) + 1;
        this.activeBookings = Math.floor(Math.random() * 3);
        this.completedBookings = this.totalBookings - this.activeBookings;
        this.loadRecentActivities();
      }
    }
  }

  private loadRecentActivities(): void {
    // Mock recent activities for demo
    this.recentActivities = [
      {
        type: 'booking',
        icon: 'book_online',
        title: 'Booking Confirmed',
        description: 'Your booking for Summer Camp 2024 has been confirmed',
        time: '2 hours ago'
      },
      {
        type: 'document',
        icon: 'description',
        title: 'Document Approved',
        description: 'Medical certificate has been approved',
        time: '1 day ago'
      },
      {
        type: 'feedback',
        icon: 'feedback',
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback on Mountain Resort',
        time: '3 days ago'
      }
    ];
  }

  goToCamps(): void {
    this.router.navigate(['/camps']);
  }

  goToSanatoriums(): void {
    this.router.navigate(['/sanatoriums']);
  }

  goToBookings(): void {
    // For now, redirect to camps page since bookings component doesn't exist yet
    this.router.navigate(['/camps']);
  }

  goToDocuments(): void {
    // For now, redirect to camps page since documents component doesn't exist yet
    this.router.navigate(['/camps']);
  }

  goToProfile(): void {
    this.router.navigate(['profile']);
  }

  goToFeedbacks(): void {
    this.router.navigate(['/camps']);
  }

  openBookingDialog(): void {
    const dialogRef = this.dialog.open(BookingDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Booking created:', result);
        // Here you would typically send the booking data to your backend
        // this.bookingService.createBooking(result).subscribe(...)
      }
    });
  }

  openFeedbackDialog(): void {
    const dialogRef = this.dialog.open(FeedbackDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Feedback submitted:', result);
        // Here you would typically send the feedback data to your backend
        // this.feedbackService.submitFeedback(result).subscribe(...)
      }
    });
  }
}