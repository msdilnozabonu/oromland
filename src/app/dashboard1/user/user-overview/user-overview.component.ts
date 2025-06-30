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
import { BookingService } from '../../../services/booking.service';
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
      <!-- Burger Menu Button -->
      <button class="burger-menu-btn" (click)="toggleBurgerMenu()">
        <span class="burger-line"></span>
        <span class="burger-line"></span>
        <span class="burger-line"></span>
      </button>

      <!-- Sidebar Burger Menu -->
      <nav class="sidebar" [class.open]="isBurgerMenuOpen">
        <button class="close-btn" (click)="toggleBurgerMenu()">&times;</button>
        <ul>
          <li><a (click)="goToCamps()">Camps</a></li>
          <li><a (click)="goToSanatoriums()">Sanatoriums</a></li>
          <li><a (click)="goToBookings()">My Bookings</a></li>
          <li><a (click)="goToProfile()">Profile</a></li>
          <li><a (click)="openFeedbackDialog()">Feedback</a></li>
        </ul>
      </nav>

      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="welcome-card">
          <div class="welcome-content">
            <div class="welcome-icon">
              <i class="material-icons">waving_hand</i>
            </div>
            <h1 class="welcome-title">{{ hasBookings ? 'Welcome back, ' + userName + '!' : 'Welcome!' }}</h1>
            <p class="welcome-subtitle" *ngIf="hasBookings">Ready to explore amazing places?</p>
            
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
                  Create Booking
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

      <div class="image-card-demo">
        <app-image-card [data]="imageCardData"></app-image-card>
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
  isBurgerMenuOpen = false;

  // Sample image card data (should be replaced with real data from backend)
  imageCardData: ImageCardData = {
    id: '1',
    title: 'Mountain Camp',
    subtitle: 'Adventure & Nature',
    description: 'A beautiful camp in the mountains with lots of activities.',
    imageUrl: 'https://oromland.uz/images/sample-camp.jpg',
    type: 'camps',
    rating: 4.7,
    price: 120,
    location: 'Tashkent Region',
    features: ['WiFi', 'Pool', 'Nature'],
    status: 'active',
    badge: { text: 'Popular', color: '#4CAF50' },
    actions: {
      primary: { label: 'Book Now', action: 'book' },
      secondary: { label: 'View', action: 'view' }
    }
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private bookingService: BookingService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.firstName;
      
      // Check if user is new (created within last 24 hours)
      const isNewUser = this.isNewUser(user);
      
      if (isNewUser) {
        // New user - show welcome message with zero stats
        this.hasBookings = false;
        this.totalBookings = 0;
        this.activeBookings = 0;
        this.completedBookings = 0;
      } else {
        // Existing user - fetch real data from backend
        this.loadUserBookingsData(user.userId);
      }
    }
  }

  private isNewUser(user: any): boolean {
    // Check if user token indicates new user or if user has no previous bookings
    const token = this.authService.getToken();
    if (token && token.includes('new-user')) {
      return true;
    }
    
    // Check user creation time if available
    const userCreationTime = user.createdAt || user.registrationDate;
    if (userCreationTime) {
      const creationDate = new Date(userCreationTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - creationDate.getTime()) / (1000 * 60 * 60);
      return hoursDiff < 24; // User is new if registered within last 24 hours
    }
    
    return false;
  }

  private loadUserBookingsData(userId: number): void {
    // Load both camp and sanatorium bookings
    const campBookings$ = this.bookingService.getCampBookings({ userId });
    const sanatoriumBookings$ = this.bookingService.getSanatoriumBookings({ userId });
    
    // Combine both requests
    campBookings$.subscribe({
      next: (campBookingsRes) => {
        const campBookings = campBookingsRes?.content || campBookingsRes || [];
        
        sanatoriumBookings$.subscribe({
          next: (sanatoriumBookingsRes) => {
            const sanatoriumBookings = sanatoriumBookingsRes?.content || sanatoriumBookingsRes || [];
            
            // Combine all bookings
            const allBookings = [...campBookings, ...sanatoriumBookings];
            
            this.hasBookings = allBookings.length > 0;
            this.totalBookings = allBookings.length;
            this.activeBookings = allBookings.filter((b: any) => 
              b.status === 'PENDING' || b.status === 'APPROVED'
            ).length;
            this.completedBookings = allBookings.filter((b: any) => 
              b.status === 'COMPLETED'
            ).length;
            
            if (this.hasBookings) {
              this.loadRecentActivities(allBookings);
            }
          },
          error: () => {
            // Handle sanatorium bookings error
            this.handleBookingsError(campBookings);
          }
        });
      },
      error: () => {
        // Handle camp bookings error - try sanatorium only
        sanatoriumBookings$.subscribe({
          next: (sanatoriumBookingsRes) => {
            const sanatoriumBookings = sanatoriumBookingsRes?.content || sanatoriumBookingsRes || [];
            this.handleBookingsError(sanatoriumBookings);
          },
          error: () => {
            // Both requests failed - set to no bookings
            this.hasBookings = false;
            this.totalBookings = 0;
            this.activeBookings = 0;
            this.completedBookings = 0;
          }
        });
      }
    });
  }

  private handleBookingsError(bookings: any[]): void {
    this.hasBookings = bookings.length > 0;
    this.totalBookings = bookings.length;
    this.activeBookings = bookings.filter((b: any) => 
      b.status === 'PENDING' || b.status === 'APPROVED'
    ).length;
    this.completedBookings = bookings.filter((b: any) => 
      b.status === 'COMPLETED'
    ).length;
    
    if (this.hasBookings) {
      this.loadRecentActivities(bookings);
    }
  }

  private loadRecentActivities(bookings?: any[]): void {
    if (bookings && bookings.length > 0) {
      // Generate recent activities based on actual bookings
      this.recentActivities = bookings
        .slice(0, 3) // Take only the 3 most recent
        .map((booking, index) => ({
          type: 'booking' as const,
          icon: 'book_online',
          title: `Booking ${booking.status?.toLowerCase() || 'created'}`,
          description: `Your booking ${booking.firstName ? 'for ' + booking.firstName : ''} ${this.getBookingStatusMessage(booking.status)}`,
          time: this.getTimeAgo(booking.createdAt || booking.startDate)
        }));
    } else {
      // Default activities for demo
      this.recentActivities = [
        {
          type: 'booking',
          icon: 'book_online',
          title: 'Welcome!',
          description: 'Start your journey by creating your first booking',
          time: 'Just now'
        }
      ];
    }
  }

  private getBookingStatusMessage(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'is being reviewed';
      case 'APPROVED': return 'has been approved';
      case 'REJECTED': return 'needs attention';
      case 'COMPLETED': return 'has been completed';
      default: return 'has been created';
    }
  }

  private getTimeAgo(dateString: string): string {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Recently';
    }
  }

  toggleBurgerMenu(): void {
    this.isBurgerMenuOpen = !this.isBurgerMenuOpen;
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