import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  Booking, 
  Child, 
  Document as BookingDocument, 
  DocumentStatus, 
  BookingStatus, 
  Gender, 
  Relationship 
} from '../models/booking.model';
import { Document } from '../models/document.model';

export interface CreateBookingRequest {
  placeId: number;
  placeType: 'sanatorium' | 'camp';
  groupId?: number;
  children: Partial<Child>[];
  startDate: string;
  endDate: string;
}

export interface BookingSearchParams {
  status?: BookingStatus;
  userId?: number;
  placeId?: number;
  placeType?: 'sanatorium' | 'camp';
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}
  getUserBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/api/v1/user/bookings`).pipe(
      catchError(this.handleError)
    );
  }

  getBookingById(id: number, placeType: 'sanatorium' | 'camp'): Observable<Booking> {
    return this.http.get<Booking>(
      `${this.baseUrl}/api/v1/user/bookings/${placeType}/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  createBooking(bookingData: CreateBookingRequest): Observable<Booking> {
    const endpoint = bookingData.placeType === 'sanatorium' 
      ? '/api/sanatoriums/booking'
      : '/api/camps/booking';

    return this.http.post<Booking>(
      `${this.baseUrl}${endpoint}`,
      bookingData
    ).pipe(
      catchError(this.handleError)
    );
  }

  updateBooking(
    id: number, 
    placeType: 'sanatorium' | 'camp',
    updates: Partial<Booking>
  ): Observable<Booking> {
    return this.http.put<Booking>(
      `${this.baseUrl}/api/v1/user/bookings/${placeType}/${id}`,
      updates
    ).pipe(
      catchError(this.handleError)
    );
  }

  cancelBooking(id: number, placeType: 'sanatorium' | 'camp'): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/api/v1/user/bookings/${placeType}/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  getUserDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.baseUrl}/api/v1/user/documents`).pipe(
      catchError(this.handleError)
    );
  }

  getDocumentById(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.baseUrl}/api/v1/user/documents/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  uploadDocument(childId: number, file: File): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('childId', childId.toString());

    return this.http.post<Document>(
      `${this.baseUrl}/api/v1/user/documents`,
      formData
    ).pipe(
      catchError(this.handleError)
    );
  }

  getAllBookings(searchParams?: BookingSearchParams): Observable<{ 
    content: Booking[]; 
    totalElements: number 
  }> {
    let params = new HttpParams();

    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }

    return this.http.get<{ content: Booking[]; totalElements: number }>(
      `${this.baseUrl}/dashboard/admin/bookings`,
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getAllDocuments(searchParams?: { 
    status?: DocumentStatus; 
    userId?: number 
  }): Observable<{ content: Document[]; totalElements: number }> {
    let params = new HttpParams();

    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }

    return this.http.get<{ content: Document[]; totalElements: number }>(
      `${this.baseUrl}/dashboard/admin/documents`,
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getManagerBookings(placeType: 'sanatorium' | 'camp'): Observable<Booking[]> {
    return this.http.get<Booking[]>(
      `${this.baseUrl}/api/v1/manager/${placeType}/bookings`
    ).pipe(
      catchError(this.handleError)
    );
  }

  getManagerBookingDetails(
    placeType: 'sanatorium' | 'camp',
    placeId: number,
    bookingId: number
  ): Observable<Booking> {
    return this.http.get<Booking>(
      `${this.baseUrl}/api/v1/manager/${placeType}/${placeId}/bookings/${bookingId}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  updateManagerBooking(
    placeType: 'sanatorium' | 'camp',
    placeId: number,
    bookingId: number,
    updates: Partial<Booking>
  ): Observable<Booking> {
    return this.http.put<Booking>(
      `${this.baseUrl}/api/v1/manager/${placeType}/${placeId}/bookings/${bookingId}`,
      updates
    ).pipe(
      catchError(this.handleError)
    );
  }

  acceptDocument(id: number, comment?: string): Observable<Document> {
    return this.http.put<Document>(
      `${this.baseUrl}/api/v1/manager/documents/${id}/accept`,
      { comment }
    ).pipe(
      catchError(this.handleError)
    );
  }

  rejectDocument(id: number, comment: string): Observable<Document> {
    return this.http.put<Document>(
      `${this.baseUrl}/api/v1/manager/documents/${id}/reject`,
      { comment }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getSuperAdminBookings(placeType: 'sanatorium' | 'camp'): Observable<Booking[]> {
    return this.http.get<Booking[]>(
      `${this.baseUrl}/dashboard/super-admin/bookings/${placeType}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || error.message || 'Server error';
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}