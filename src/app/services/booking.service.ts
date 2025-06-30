import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { 
  Booking, 
  Child, 
  Document as BookingDocument, 
  DocumentStatus, 
  BookingStatus, 
  Gender, 
  Relationship,
  BookingCampDTO,
  BookingSanatorium,
  BookingStats,
  DashboardData
} from '../models/booking.model';
import { Document } from '../models/document.model';

export interface CreateBookingRequest {
  placeId: number;
  groupId: number;
  children: Partial<Child>[];
}

export interface BookingSearchParams {
  status?: string;
  userId?: number;
  placeId?: number;
  page?: number;
  size?: number;
}

export interface ReviewData {
  id?: number;
  bookingId: number;
  rating: number;
  comment: string;
  reviewDate?: string;
  userId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = environment.apiBaseUrl;
  
  // Backend endpoints
  private readonly CAMP_BOOKING_URL = `${this.apiUrl}/booking-camp`;
  private readonly SANATORIUM_BOOKING_URL = `${this.apiUrl}/booking-sanatorium`;
  private readonly UPLOAD_URL = `${this.apiUrl}/files`;
  private readonly REVIEWS_URL = `${this.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  // CAMP BOOKINGS
  createCampBooking(booking: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/booking-camp`, booking).pipe(
      catchError(error => {
        console.warn('API createCampBooking failed, using mock:', error);
        return of({ ...booking, id: Math.floor(Math.random() * 1000) });
      })
    );
  }

  updateCampBooking(id: number, booking: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/booking-camp/${id}`, booking).pipe(
      catchError(error => {
        console.warn('API updateCampBooking failed, using mock:', error);
        return of({ ...booking, id });
      })
    );
  }

  getCampBookings(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/booking-camp`, { params }).pipe(
      catchError(error => {
        console.warn('API getCampBookings failed, using mock:', error);
        return of({ content: this.getMockCampBookings() });
      })
    );
  }

  getCampBookingById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/booking-camp/${id}`);
  }

  // SANATORIUM BOOKINGS
  createSanatoriumBooking(booking: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/booking-sanatorium`, booking).pipe(
      catchError(error => {
        console.warn('API createSanatoriumBooking failed, using mock:', error);
        return of({ ...booking, id: Math.floor(Math.random() * 1000) });
      })
    );
  }

  updateSanatoriumBooking(id: number, booking: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/booking-sanatorium/${id}`, booking).pipe(
      catchError(error => {
        console.warn('API updateSanatoriumBooking failed, using mock:', error);
        return of({ ...booking, id });
      })
    );
  }

  getSanatoriumBookings(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/booking-sanatorium`, { params }).pipe(
      catchError(error => {
        console.warn('API getSanatoriumBookings failed, using mock:', error);
        return of({ content: this.getMockSanatoriumBookings() });
      })
    );
  }

  getSanatoriumBookingById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/booking-sanatorium/${id}`);
  }

  // DOCUMENTS (example for file upload)
  uploadDocument(type: string, bookingId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/booking-${type}/${bookingId}/upload`, formData);
  }

  // DASHBOARD STATS
  getDashboardStats(userId: number): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard/stats/${userId}`);
  }

  // REVIEWS
  getBookingReviews(bookingId: number): Observable<ReviewData[]> {
    return this.http.get<ReviewData[]>(`${this.apiUrl}/reviews/booking/${bookingId}`);
  }

  createReview(review: ReviewData): Observable<ReviewData> {
    return this.http.post<ReviewData>(`${this.apiUrl}/reviews`, review);
  }

  updateReview(id: number, review: ReviewData): Observable<ReviewData> {
    return this.http.put<ReviewData>(`${this.apiUrl}/reviews/${id}`, review);
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reviews/${id}`);
  }

  // BOOKING STATUS UPDATES
  updateBookingStatus(bookingId: number, status: DocumentStatus, type: 'camp' | 'sanatorium'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/booking-${type}/${bookingId}/status`, { status });
  }

  // PREFILL DATA (for redirected bookings)
  setPrefilledData(data: any): void {
    if (typeof window !== 'undefined' && sessionStorage) {
      sessionStorage.setItem('prefilledBookingData', JSON.stringify(data));
    }
  }

  getPrefilledData(): any {
    if (typeof window !== 'undefined' && sessionStorage) {
      const data = sessionStorage.getItem('prefilledBookingData');
      if (data) {
        sessionStorage.removeItem('prefilledBookingData');
        return JSON.parse(data);
      }
    }
    return null;
  }

  // USER STATISTICS
  getUserBookingStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/booking-stats`).pipe(
      catchError(error => {
        console.warn('API getUserBookingStats failed, using mock:', error);
        return of({
          totalBookings: 0,
          pendingBookings: 0,
          approvedBookings: 0,
          rejectedBookings: 0
        });
      })
    );
  }

  getUserReviews(): Observable<any> {
    return this.http.get(`${this.REVIEWS_URL}/user`).pipe(
      catchError(error => {
        console.warn('API getUserReviews failed, using mock:', error);
        return of([]);
      })
    );
  }

  // CAMP/SANATORIUM SELECTION DATA (from main pages)
  setSelectedPlace(placeData: any): void {
    if (typeof window !== 'undefined' && sessionStorage) {
      sessionStorage.setItem('selectedPlaceData', JSON.stringify(placeData));
    }
  }

  getSelectedPlace(): any {
    if (typeof window !== 'undefined' && sessionStorage) {
      const data = sessionStorage.getItem('selectedPlaceData');
      if (data) {
        sessionStorage.removeItem('selectedPlaceData');
        return JSON.parse(data);
      }
    }
    return null;
  }

  // IMAGE HANDLING
  getImageUrl(imagePath: string, type: 'camp' | 'sanatorium' | 'user', defaultImage: string = 'default.jpg'): string {
    if (imagePath && imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath) {
      return `${environment.apiBaseUrl}/files/${imagePath}`;
    }
    
    // Return default image from assets
    return `/assets/images/${type}/${defaultImage}`;
  }

  // FILE UPLOAD HELPER
  uploadFile(file: File, type: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${environment.apiBaseUrl}/files/upload`, formData);
  }

  // MOCK DATA for development
  private generateMockStats(isNewUser: boolean): BookingStats {
    if (isNewUser) {
      return {
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
        newBookingsThisMonth: 0
      };
    }
    return {
      totalBookings: Math.floor(Math.random() * 50) + 10,
      pendingBookings: Math.floor(Math.random() * 10) + 1,
      confirmedBookings: Math.floor(Math.random() * 30) + 5,
      cancelledBookings: Math.floor(Math.random() * 5),
      totalRevenue: Math.floor(Math.random() * 100000) + 10000,
      newBookingsThisMonth: Math.floor(Math.random() * 10) + 1
    };
  }

  getMockDashboardData(userId: number, isNewUser = false): Observable<DashboardData> {
    const mockData: DashboardData = {
      user: null,
      stats: this.generateMockStats(isNewUser),
      recentBookings: [],
      isNewUser
    };
    return of(mockData);
  }



  private getMockCampBookings(): BookingCampDTO[] {
    return [
      {
        id: 1,
        firstName: 'Alisher',
        lastName: 'Karimov',
        birthDate: '2015-05-15',
        gender: 'MALE',
        documentNumber: 'AB1234567',
        address: 'Tashkent, Yunusabad district',
        guardianFirstName: 'Bekzod',
        guardianLastName: 'Karimov',
        guardianPhone: '+998901234567',
        guardianDocument: 'AC9876543',
        guardianJob: 'Teacher',
        documentStatus: DocumentStatus.APPROVED,
        healthNoteFilePath: 1,
        birthCertificateFilePath: 2,
        photoFilePath: 3,
        parentPassportFile: 4,
        guardianPermissionFilePath: 5,
        privilegeDocumentPath: 6
      },
      {
        id: 2,
        firstName: 'Malika',
        lastName: 'Usmonova',
        birthDate: '2016-08-22',
        gender: 'FEMALE',
        documentNumber: 'AB2345678',
        address: 'Samarqand, Center district',
        guardianFirstName: 'Dilnoza',
        guardianLastName: 'Usmonova',
        guardianPhone: '+998902345678',
        guardianDocument: 'AC8765432',
        guardianJob: 'Doctor',
        documentStatus: DocumentStatus.PENDING,
        healthNoteFilePath: 7,
        birthCertificateFilePath: 8,
        photoFilePath: 9
      }
    ];
  }

  private getMockSanatoriumBookings(): BookingSanatorium[] {
    return [
      {
        id: 1,
        startDate: '2024-06-15',
        endDate: '2024-06-25',
        durationDays: 10,
        totalPrice: 1500000,
        status: DocumentStatus.APPROVED
      },
      {
        id: 2,
        startDate: '2024-07-01',
        endDate: '2024-07-15',
        durationDays: 14,
        totalPrice: 2100000,
        status: DocumentStatus.PENDING
      }
    ];
  }
}