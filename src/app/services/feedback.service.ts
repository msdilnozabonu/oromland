import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Feedback, CreateFeedbackRequest } from '../models/feedback.model';

export interface FeedbackSearchParams {
  placeId?: number;
  placeType?: 'sanatorium' | 'camp';
  userId?: number;
  rating?: number;
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private baseUrl = `${environment.apiUrl}/api/v1/feedback`;

  constructor(private http: HttpClient) {}

  /**
   * Get feedbacks for a specific place
   * @param placeId The place ID
   * @param placeType 'sanatorium' or 'camp'
   * @param page Page number (0-based)
   * @param size Page size
   */
  getPlaceFeedbacks(
    placeId: number,
    placeType: 'sanatorium' | 'camp',
    page: number = 0,
    size: number = 10
  ): Observable<{ content: Feedback[]; totalElements: number }> {
    const params = new HttpParams()
      .set('placeId', placeId.toString())
      .set('placeType', placeType)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<{ content: Feedback[]; totalElements: number }>(
      `${this.baseUrl}/place`,
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get feedbacks for the current user
   */
  getUserFeedbacks(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.baseUrl}/user`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get a specific feedback by ID
   * @param id Feedback ID
   */
  getFeedbackById(id: number): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create new feedback
   * @param feedback Feedback data
   */
  createFeedback(feedback: CreateFeedbackRequest): Observable<Feedback> {
    return this.http.post<Feedback>(this.baseUrl, feedback).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update existing feedback
   * @param id Feedback ID
   * @param updates Feedback updates
   */
  updateFeedback(id: number, updates: Partial<CreateFeedbackRequest>): Observable<Feedback> {
    return this.http.put<Feedback>(`${this.baseUrl}/${id}`, updates).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete feedback (user endpoint)
   * @param id Feedback ID
   */
  deleteFeedback(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get all feedbacks (admin endpoint)
   * @param searchParams Search parameters
   */
  getAllFeedbacks(searchParams?: FeedbackSearchParams): Observable<{ content: Feedback[]; totalElements: number }> {
    let params = new HttpParams();

    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }

    return this.http.get<{ content: Feedback[]; totalElements: number }>(
      `${this.baseUrl}/admin`,
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete feedback as admin
   * @param id Feedback ID
   */
  deleteFeedbackAsAdmin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get average rating for a place
   * @param placeId Place ID
   * @param placeType 'sanatorium' or 'camp'
   */
  getAverageRating(placeId: number, placeType: 'sanatorium' | 'camp'): Observable<number> {
    const params = new HttpParams()
      .set('placeId', placeId.toString())
      .set('placeType', placeType);

    return this.http.get<{ average: number }>(`${this.baseUrl}/average-rating`, { params }).pipe(
      map(response => response.average),
      catchError(this.handleError)
    );
  }

  /**
   * Handle API errors
   * @param error The error response
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || 'Server error';
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}