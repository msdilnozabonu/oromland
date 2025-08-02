import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Document, DocumentStatus } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private baseUrl = `${environment.apiUrl}/api/v1/documents`;

  constructor(private http: HttpClient) {}

  /**
   * Get all documents for the current user
   */
  getUserDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(this.baseUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get documents for a specific booking
   * @param bookingId The booking ID
   * @param placeType 'sanatorium' or 'camp'
   */
  getBookingDocuments(bookingId: number, placeType: 'sanatorium' | 'camp'): Observable<Document[]> {
    const params = new HttpParams()
      .set('bookingId', bookingId.toString())
      .set('placeType', placeType);

    return this.http.get<Document[]>(`${this.baseUrl}/booking`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Upload a new document
   * @param formData FormData containing the file and metadata
   */
  uploadDocument(formData: FormData): Observable<Document> {
    return this.http.post<Document>(this.baseUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete a document
   * @param documentId The document ID to delete
   */
  deleteDocument(documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${documentId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Approve a document (for managers/admins)
   * @param documentId The document ID to approve
   * @param comment Optional approval comment
   */
  approveDocument(documentId: number, comment?: string): Observable<Document> {
    return this.http.put<Document>(
      `${this.baseUrl}/${documentId}/approve`,
      { comment }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Reject a document (for managers/admins)
   * @param documentId The document ID to reject
   * @param comment Rejection reason (required)
   */
  rejectDocument(documentId: number, comment: string): Observable<Document> {
    if (!comment) {
      return throwError(() => new Error('Rejection comment is required'));
    }

    return this.http.put<Document>(
      `${this.baseUrl}/${documentId}/reject`,
      { comment }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get documents requiring review (for managers/admins)
   * @param status Filter by status (default: PENDING)
   */
  getDocumentsForReview(status: DocumentStatus = DocumentStatus.PENDING): Observable<Document[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<Document[]>(`${this.baseUrl}/review`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get document download URL
   * @param documentId The document ID
   */
  getDocumentDownloadUrl(documentId: number): string {
    return `${this.baseUrl}/${documentId}/download`;
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
      errorMessage = error.error?.message || error.message || 'Server error';
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}