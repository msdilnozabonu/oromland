import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

import { AuthService } from '../../../services/auth.service';
import { BookingService, ReviewData } from '../../../services/booking.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  template: `
    <div class="reviews-container">
      <div class="header">
        <button class="back-btn" (click)="goBack()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="header-content">
          <h1><i class="fas fa-star"></i> Reviews</h1>
          <p>Share your experience and view your reviews</p>
        </div>
      </div>

      <mat-tab-group class="reviews-tabs">
        <!-- Write Review Tab -->
        <mat-tab label="Write Review" *ngIf="canWriteReview">
          <div class="tab-content">
            <div class="review-form-card">
              <h2><i class="fas fa-pen"></i> Write a Review</h2>
              <p *ngIf="bookingInfo">Review for: <strong>{{bookingInfo}}</strong></p>
              
              <form [formGroup]="reviewForm" (ngSubmit)="submitReview()" class="review-form">
                <div class="rating-section">
                  <label>Rating</label>
                  <div class="star-rating">
                    <button type="button" 
                            *ngFor="let star of [1,2,3,4,5]" 
                            class="star-btn"
                            [class.active]="star <= selectedRating"
                            (click)="setRating(star)">
                      <i class="fas fa-star"></i>
                    </button>
                  </div>
                  <span class="rating-text">{{getRatingText(selectedRating)}}</span>
                </div>

                <div class="form-section">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Your Review</mat-label>
                    <textarea matInput 
                              formControlName="comment" 
                              placeholder="Share your experience..."
                              rows="6"></textarea>
                    <mat-error *ngIf="reviewForm.get('comment')?.hasError('required')">
                      Review comment is required
                    </mat-error>
                    <mat-error *ngIf="reviewForm.get('comment')?.hasError('minlength')">
                      Review must be at least 10 characters long
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-actions">
                  <button type="button" mat-button (click)="resetForm()" class="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" 
                          mat-raised-button 
                          color="primary" 
                          [disabled]="!reviewForm.valid || selectedRating === 0 || isSubmitting"
                          class="submit-btn">
                    <i class="fas fa-check" *ngIf="!isSubmitting"></i>
                    <i class="fas fa-spinner fa-spin" *ngIf="isSubmitting"></i>
                    {{isSubmitting ? 'Submitting...' : 'Submit Review'}}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </mat-tab>

        <!-- My Reviews Tab -->
        <mat-tab label="My Reviews">
          <div class="tab-content">
            <div class="reviews-list" *ngIf="userReviews.length > 0; else noReviews">
              <div *ngFor="let review of userReviews" class="review-card">
                <div class="review-header">
                  <div class="review-rating">
                    <div class="stars">
                      <i *ngFor="let star of [1,2,3,4,5]" 
                         class="fas fa-star"
                         [class.active]="star <= review.rating"></i>
                    </div>
                    <span class="rating-number">{{review.rating}}/5</span>
                  </div>
                  <div class="review-date">
                    {{formatDate(review.reviewDate || '')}}
                  </div>
                </div>

                <div class="review-content">
                  <p>{{review.comment}}</p>
                </div>

                <div class="review-actions">
                  <button mat-button (click)="editReview(review)" class="edit-btn">
                    <i class="fas fa-edit"></i>
                    Edit
                  </button>
                  <button mat-button (click)="deleteReview(review)" class="delete-btn">
                    <i class="fas fa-trash"></i>
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <ng-template #noReviews>
              <div class="no-reviews">
                <i class="fas fa-star-half-alt"></i>
                <h3>No Reviews Yet</h3>
                <p>You haven't written any reviews yet. Complete your bookings to share your experience!</p>
              </div>
            </ng-template>
          </div>
        </mat-tab>

        <!-- All Reviews Tab (if admin) -->
        <mat-tab label="All Reviews" *ngIf="isAdmin">
          <div class="tab-content">
            <div class="reviews-list" *ngIf="allReviews.length > 0; else noAllReviews">
              <div *ngFor="let review of allReviews" class="review-card admin-view">
                <div class="review-header">
                  <div class="reviewer-info">
                    <strong>User #{{review.userId}}</strong>
                    <span class="booking-info">Booking #{{review.bookingId}}</span>
                  </div>
                  <div class="review-rating">
                    <div class="stars">
                      <i *ngFor="let star of [1,2,3,4,5]" 
                         class="fas fa-star"
                         [class.active]="star <= review.rating"></i>
                    </div>
                    <span class="rating-number">{{review.rating}}/5</span>
                  </div>
                </div>

                <div class="review-content">
                  <p>{{review.comment}}</p>
                </div>

                <div class="review-meta">
                  <span class="review-date">{{formatDate(review.reviewDate || '')}}</span>
                </div>
              </div>
            </div>

            <ng-template #noAllReviews>
              <div class="no-reviews">
                <i class="fas fa-comments"></i>
                <h3>No Reviews Available</h3>
                <p>No reviews have been submitted yet.</p>
              </div>
            </ng-template>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {
  reviewForm: FormGroup;
  selectedRating = 0;
  isSubmitting = false;
  canWriteReview = false;
  isAdmin = false;
  
  bookingId: number = 0;
  bookingType: string = '';
  bookingInfo: string = '';
  
  userReviews: ReviewData[] = [];
  allReviews: ReviewData[] = [];
  currentUser: any;
  editingReview: ReviewData | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private bookingService: BookingService,
    private snackBar: MatSnackBar
  ) {
    this.reviewForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser?.role?.name === 'ADMIN' || this.currentUser?.role?.name === 'SUPER_ADMIN';
    
    // Check if coming from booking page with specific booking to review
    this.route.queryParams.subscribe(params => {
      if (params['bookingId'] && params['type']) {
        this.bookingId = parseInt(params['bookingId']);
        this.bookingType = params['type'];
        this.canWriteReview = true;
        this.bookingInfo = `${this.bookingType.charAt(0).toUpperCase() + this.bookingType.slice(1)} Booking #${this.bookingId}`;
      }
    });

    this.loadUserReviews();
    if (this.isAdmin) {
      this.loadAllReviews();
    }
  }

  private loadUserReviews(): void {
    if (!this.currentUser) return;
    
    // Load user's own reviews - mock data for now
    this.userReviews = [
      {
        id: 1,
        bookingId: 123,
        rating: 5,
        comment: "Amazing experience! The camp was well-organized and the staff was very friendly. My child had a great time and learned a lot.",
        reviewDate: '2024-01-15',
        userId: this.currentUser.userId
      },
      {
        id: 2,
        bookingId: 124,
        rating: 4,
        comment: "Good sanatorium with excellent medical facilities. The accommodation was comfortable and the food was delicious.",
        reviewDate: '2024-01-10',
        userId: this.currentUser.userId
      }
    ];
  }

  private loadAllReviews(): void {
    // Load all reviews for admin view - mock data for now
    this.allReviews = [
      ...this.userReviews,
      {
        id: 3,
        bookingId: 125,
        rating: 3,
        comment: "Average experience. Could be better with more activities.",
        reviewDate: '2024-01-12',
        userId: 456
      }
    ];
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
    this.reviewForm.patchValue({ rating: rating });
  }

  getRatingText(rating: number): string {
    const texts = {
      0: 'Select rating',
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return texts[rating as keyof typeof texts] || '';
  }

  submitReview(): void {
    if (!this.reviewForm.valid || this.selectedRating === 0) {
      this.showSnackBar('Please fill all required fields and select a rating', 'error');
      return;
    }

    this.isSubmitting = true;

    const reviewData: ReviewData = {
      bookingId: this.bookingId || 0,
      rating: this.selectedRating,
      comment: this.reviewForm.value.comment,
      userId: this.currentUser.userId
    };

    if (this.editingReview) {
      // Update existing review
      reviewData.id = this.editingReview.id;
      this.bookingService.updateReview(this.editingReview.id!, reviewData).subscribe({
        next: (response) => {
          this.showSnackBar('Review updated successfully!', 'success');
          this.resetForm();
          this.loadUserReviews();
        },
        error: (error) => {
          console.error('Error updating review:', error);
          this.showSnackBar('Failed to update review. Please try again.', 'error');
          this.isSubmitting = false;
        }
      });
    } else {
      // Create new review
      this.bookingService.createReview(reviewData).subscribe({
        next: (response) => {
          this.showSnackBar('Review submitted successfully!', 'success');
          this.resetForm();
          this.loadUserReviews();
        },
        error: (error) => {
          console.error('Error creating review:', error);
          this.showSnackBar('Failed to submit review. Please try again.', 'error');
          this.isSubmitting = false;
        }
      });
    }
  }

  editReview(review: ReviewData): void {
    this.editingReview = review;
    this.selectedRating = review.rating;
    this.reviewForm.patchValue({
      comment: review.comment
    });
    this.canWriteReview = true;
    // Switch to write review tab
  }

  deleteReview(review: ReviewData): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.bookingService.deleteReview(review.id!).subscribe({
        next: () => {
          this.showSnackBar('Review deleted successfully', 'success');
          this.loadUserReviews();
        },
        error: (error) => {
          console.error('Error deleting review:', error);
          this.showSnackBar('Failed to delete review', 'error');
        }
      });
    }
  }

  resetForm(): void {
    this.reviewForm.reset();
    this.selectedRating = 0;
    this.isSubmitting = false;
    this.editingReview = null;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  goBack(): void {
    this.router.navigate(['/dashboard1/user/bookings']);
  }

  private showSnackBar(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: [`snackbar-${type}`]
    });
  }
}