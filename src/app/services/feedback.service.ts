import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Feedback, CreateFeedbackRequest } from '../models/feedback.model';

export interface FeedbackSearchParams {
  placeId?: number;
  userId?: number;
  rating?: number;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  // Mock data
  private mockFeedbacks: Feedback[] = [
    {
      id: 1,
      userId: 1,
      placeId: 1,
      rating: 5,
      comment: 'Great place with amazing views!',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      user: { firstName: 'John', lastName: 'Doe' },
      place: { name: 'Mountain Resort', type: 'CAMP' }
    },
    {
      id: 2,
      userId: 2,
      placeId: 2,
      rating: 4,
      comment: 'Very good medical facilities and staff.',
      createdAt: '2024-01-16T14:30:00Z',
      updatedAt: '2024-01-16T14:30:00Z',
      user: { firstName: 'Jane', lastName: 'Smith' },
      place: { name: 'Health Sanatorium', type: 'SANATORIUM' }
    }
  ];
  private nextFeedbackId = 3;

  constructor() {}

  // Mock implementations
  getPlaceFeedbacks(placeId: number, page: number = 0, size: number = 10): Observable<{ content: Feedback[], totalElements: number }> {
    const placeFeedbacks = this.mockFeedbacks.filter(f => f.placeId === placeId);
    return of({ content: placeFeedbacks, totalElements: placeFeedbacks.length });
  }

  // Mock user endpoints
  getUserFeedbacks(): Observable<Feedback[]> {
    return of(this.mockFeedbacks);
  }

  getFeedbackById(id: number): Observable<Feedback> {
    const feedback = this.mockFeedbacks.find(f => f.id === id);
    if (feedback) {
      return of(feedback);
    }
    throw new Error('Feedback not found');
  }

  createFeedback(feedback: CreateFeedbackRequest): Observable<Feedback> {
    const newFeedback: Feedback = {
      id: this.nextFeedbackId++,
      userId: 1,
      placeId: feedback.placeId,
      rating: feedback.rating,
      comment: feedback.comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: { firstName: 'User', lastName: 'Test' },
      place: { name: 'Test Place', type: 'CAMP' },
      bookingId: feedback.bookingId
    };
    
    this.mockFeedbacks.push(newFeedback);
    return of(newFeedback);
  }

  updateFeedback(id: number, feedback: Partial<CreateFeedbackRequest>): Observable<Feedback> {
    const index = this.mockFeedbacks.findIndex(f => f.id === id);
    if (index !== -1) {
      if (feedback.rating) this.mockFeedbacks[index].rating = feedback.rating;
      if (feedback.comment) this.mockFeedbacks[index].comment = feedback.comment;
      this.mockFeedbacks[index].updatedAt = new Date().toISOString();
      return of(this.mockFeedbacks[index]);
    }
    throw new Error('Feedback not found');
  }

  deleteFeedback(id: number): Observable<void> {
    const index = this.mockFeedbacks.findIndex(f => f.id === id);
    if (index !== -1) {
      this.mockFeedbacks.splice(index, 1);
      return of(void 0);
    }
    throw new Error('Feedback not found');
  }

  // Mock admin endpoints
  getAllFeedbacks(searchParams?: FeedbackSearchParams): Observable<{ content: Feedback[], totalElements: number }> {
    let feedbacks = [...this.mockFeedbacks];
    
    if (searchParams?.placeId) {
      feedbacks = feedbacks.filter(f => f.placeId === searchParams.placeId);
    }
    
    if (searchParams?.userId) {
      feedbacks = feedbacks.filter(f => f.userId === searchParams.userId);
    }
    
    if (searchParams?.rating) {
      feedbacks = feedbacks.filter(f => f.rating === searchParams.rating);
    }
    
    return of({ content: feedbacks, totalElements: feedbacks.length });
  }

  deleteFeedbackAsAdmin(id: number): Observable<void> {
    return this.deleteFeedback(id);
  }
}