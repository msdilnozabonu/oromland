import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-feedback-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="feedback-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>feedback</mat-icon>
          Share Your Experience
        </h2>
        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="feedbackForm" class="feedback-form">
          <div class="rating-section">
            <h3>Overall Rating</h3>
            <div class="star-rating">
              <button type="button" 
                      *ngFor="let star of stars; let i = index"
                      class="star-btn"
                      [class.active]="i < rating"
                      (click)="setRating(i + 1)">
                <mat-icon>{{i < rating ? 'star' : 'star_border'}}</mat-icon>
              </button>
            </div>
            <p class="rating-text">{{getRatingText()}}</p>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Select Place</mat-label>
            <mat-select formControlName="placeId" required>
              <mat-option *ngFor="let place of visitedPlaces" [value]="place.id">
                <div class="place-option">
                  <mat-icon>{{place.type === 'camp' ? 'nature_people' : 'local_hospital'}}</mat-icon>
                  <span>{{place.name}}</span>
                </div>
              </mat-option>
            </mat-select>
          </mat-form-field>

          <div class="category-ratings">
            <h3>Rate Different Aspects</h3>
            
            <div class="category-item">
              <div class="category-header">
                <mat-icon>hotel</mat-icon>
                <span>Accommodation</span>
                <span class="rating-value">{{accommodationRating}}/5</span>
              </div>
              <div class="star-rating-row">
                <button type="button" 
                        *ngFor="let star of [1,2,3,4,5]; let i = index"
                        class="star-btn small"
                        [class.active]="i < accommodationRating"
                        (click)="accommodationRating = i + 1">
                  <mat-icon>{{i < accommodationRating ? 'star' : 'star_border'}}</mat-icon>
                </button>
              </div>
            </div>

            <div class="category-item">
              <div class="category-header">
                <mat-icon>restaurant</mat-icon>
                <span>Food & Dining</span>
                <span class="rating-value">{{foodRating}}/5</span>
              </div>
              <div class="star-rating-row">
                <button type="button" 
                        *ngFor="let star of [1,2,3,4,5]; let i = index"
                        class="star-btn small"
                        [class.active]="i < foodRating"
                        (click)="foodRating = i + 1">
                  <mat-icon>{{i < foodRating ? 'star' : 'star_border'}}</mat-icon>
                </button>
              </div>
            </div>

            <div class="category-item">
              <div class="category-header">
                <mat-icon>people</mat-icon>
                <span>Staff Service</span>
                <span class="rating-value">{{serviceRating}}/5</span>
              </div>
              <div class="star-rating-row">
                <button type="button" 
                        *ngFor="let star of [1,2,3,4,5]; let i = index"
                        class="star-btn small"
                        [class.active]="i < serviceRating"
                        (click)="serviceRating = i + 1">
                  <mat-icon>{{i < serviceRating ? 'star' : 'star_border'}}</mat-icon>
                </button>
              </div>
            </div>

            <div class="category-item">
              <div class="category-header">
                <mat-icon>spa</mat-icon>
                <span>Activities & Facilities</span>
                <span class="rating-value">{{facilitiesRating}}/5</span>
              </div>
              <div class="star-rating-row">
                <button type="button" 
                        *ngFor="let star of [1,2,3,4,5]; let i = index"
                        class="star-btn small"
                        [class.active]="i < facilitiesRating"
                        (click)="facilitiesRating = i + 1">
                  <mat-icon>{{i < facilitiesRating ? 'star' : 'star_border'}}</mat-icon>
                </button>
              </div>
            </div>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>What did you like most?</mat-label>
            <textarea matInput 
                      formControlName="positiveComment" 
                      rows="3"
                      placeholder="Tell us about the highlights of your stay..."></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>What could be improved?</mat-label>
            <textarea matInput 
                      formControlName="improvementComment" 
                      rows="3"
                      placeholder="Share your suggestions for improvement..."></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Additional Comments</mat-label>
            <textarea matInput 
                      formControlName="additionalComment" 
                      rows="4"
                      placeholder="Any other thoughts or experiences you'd like to share..."></textarea>
          </mat-form-field>

          <div class="recommendation-section">
            <h3>Would you recommend this place?</h3>
            <div class="recommendation-buttons">
              <button type="button" 
                      mat-raised-button 
                      [color]="recommendation === 'yes' ? 'primary' : ''"
                      (click)="setRecommendation('yes')">
                <mat-icon>thumb_up</mat-icon>
                Yes, definitely!
              </button>
              <button type="button" 
                      mat-raised-button 
                      [color]="recommendation === 'maybe' ? 'accent' : ''"
                      (click)="setRecommendation('maybe')">
                <mat-icon>thumbs_up_down</mat-icon>
                Maybe
              </button>
              <button type="button" 
                      mat-raised-button 
                      [color]="recommendation === 'no' ? 'warn' : ''"
                      (click)="setRecommendation('no')">
                <mat-icon>thumb_down</mat-icon>
                Not really
              </button>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button 
                color="primary" 
                (click)="submitFeedback()"
                [disabled]="!feedbackForm.valid || isSubmitting">
          <mat-icon *ngIf="isSubmitting">hourglass_empty</mat-icon>
          <mat-icon *ngIf="!isSubmitting">send</mat-icon>
          {{isSubmitting ? 'Submitting...' : 'Submit Feedback'}}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .feedback-dialog {
      width: 100%;
      max-width: 600px;
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

    .feedback-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .full-width {
      width: 100%;
    }

    .rating-section {
      text-align: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 12px;

      h3 {
        margin-bottom: 1rem;
        color: #333;
      }
    }

    .star-rating {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .star-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 50%;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 193, 7, 0.1);
      }

      &.active mat-icon {
        color: #FFC107;
      }

      mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
        color: #ddd;
        transition: color 0.3s ease;
      }
    }

    .rating-text {
      font-weight: 600;
      color: #4CAF50;
      margin: 0;
    }

    .category-ratings {
      h3 {
        margin-bottom: 1rem;
        color: #333;
      }
    }

    .category-item {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .category-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;

      mat-icon {
        color: #4CAF50;
      }

      span:first-of-type {
        flex: 1;
        font-weight: 500;
      }

      .rating-value {
        font-weight: 600;
        color: #4CAF50;
      }
    }

    .star-rating-row {
      display: flex;
      gap: 0.25rem;
      margin-top: 0.5rem;
    }

    .star-btn.small {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.125rem;
      border-radius: 50%;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 193, 7, 0.1);
      }

      &.active mat-icon {
        color: #FFC107;
      }

      mat-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
        color: #ddd;
        transition: color 0.3s ease;
      }
    }

    .place-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .recommendation-section {
      text-align: center;

      h3 {
        margin-bottom: 1rem;
        color: #333;
      }
    }

    .recommendation-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;

      button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 140px;
      }
    }

    .dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    @media (max-width: 768px) {
      .recommendation-buttons {
        flex-direction: column;
        align-items: center;

        button {
          width: 100%;
          max-width: 200px;
        }
      }
    }
  `]
})
export class FeedbackDialogComponent {
  feedbackForm: FormGroup;
  isSubmitting = false;
  rating = 0;
  stars = [1, 2, 3, 4, 5];
  recommendation = '';
  
  accommodationRating = 3;
  foodRating = 3;
  serviceRating = 3;
  facilitiesRating = 3;

  visitedPlaces = [
    { id: '1', name: 'Dustlik Mount Resort', type: 'camp' },
    { id: '2', name: 'Charvak Lake Camp', type: 'camp' },
    { id: '3', name: 'Wellness Sanatorium Tashkent', type: 'sanatorium' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FeedbackDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.feedbackForm = this.fb.group({
      placeId: ['', Validators.required],
      positiveComment: [''],
      improvementComment: [''],
      additionalComment: ['']
    });
  }

  setRating(rating: number): void {
    this.rating = rating;
  }

  getRatingText(): string {
    const texts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return texts[this.rating] || 'Rate your experience';
  }

  setRecommendation(value: string): void {
    this.recommendation = value;
  }

  submitFeedback(): void {
    if (this.feedbackForm.valid && this.rating > 0) {
      this.isSubmitting = true;
      
      const feedbackData = {
        ...this.feedbackForm.value,
        overallRating: this.rating,
        categoryRatings: {
          accommodation: this.accommodationRating,
          food: this.foodRating,
          service: this.serviceRating,
          facilities: this.facilitiesRating
        },
        recommendation: this.recommendation,
        submittedAt: new Date()
      };

      setTimeout(() => {
        this.dialogRef.close(feedbackData);
      }, 1500);
    }
  }
}