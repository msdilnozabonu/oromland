import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Booking, Child, Document as BookingDocument, DocumentStatus, BookingStatus, Gender, Relationship } from '../models/booking.model';
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

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  // Mock data
  private mockBookings: Booking[] = [];
  private mockDocuments: Document[] = [];
  private nextBookingId = 1;
  private nextDocumentId = 1;

  constructor() {}

  // Mock user endpoints
  getUserBookings(): Observable<Booking[]> {
    return of(this.mockBookings);
  }

  getBookingById(id: number): Observable<Booking> {
    const booking = this.mockBookings.find(b => b.id === id);
    if (booking) {
      return of(booking);
    }
    throw new Error('Booking not found');
  }

  createBooking(booking: CreateBookingRequest): Observable<Booking> {
    const newBooking: Booking = {
      id: this.nextBookingId++,
      userId: 1,
      placeId: booking.placeId,
      groupId: booking.groupId,
      user: { userId: 1, username: 'user', firstName: 'User', lastName: 'Test', email: 'user@test.com' },
      place: { id: booking.placeId, name: 'Test Place' },
      group: { id: booking.groupId, name: 'Test Group' },
      children: booking.children.map((child, index) => ({
        id: index + 1,
        userId: 1,
        campId: booking.placeId,
        fullName: child.fullName || 'Child Test',
        birthDate: child.birthDate || '2010-01-01',
        gender: (child.gender as Gender) || Gender.MALE,
        relationship: (child.relationship as Relationship) || Relationship.SELF,
        createdAt: new Date().toISOString()
      })),
      status: BookingStatus.PENDING,
      totalAmount: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.mockBookings.push(newBooking);
    return of(newBooking);
  }

  updateBooking(id: number, booking: Partial<Booking>): Observable<Booking> {
    const index = this.mockBookings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.mockBookings[index] = { ...this.mockBookings[index], ...booking };
      return of(this.mockBookings[index]);
    }
    throw new Error('Booking not found');
  }

  cancelBooking(id: number): Observable<void> {
    const index = this.mockBookings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.mockBookings.splice(index, 1);
      return of(void 0);
    }
    throw new Error('Booking not found');
  }

  // Mock document management
  getUserDocuments(): Observable<Document[]> {
    return of(this.mockDocuments);
  }

  getDocumentById(id: number): Observable<Document> {
    const document = this.mockDocuments.find(d => d.id === id);
    if (document) {
      return of(document);
    }
    throw new Error('Document not found');
  }

  uploadDocument(childId: number, file: File): Observable<any> {
    const newDocument: Document = {
      id: this.nextDocumentId++,
      userId: 1,
      fileName: file.name,
      fileType: file.type,
      filePath: 'mock-path/' + file.name,
      status: DocumentStatus.PENDING,
      uploadDate: new Date().toISOString(),
      submittedAt: new Date().toISOString()
    };
    
    this.mockDocuments.push(newDocument);
    return of({ success: true, document: newDocument });
  }

  // Mock Admin/Manager endpoints
  getAllBookings(searchParams?: BookingSearchParams): Observable<{ content: Booking[], totalElements: number }> {
    let bookings = [...this.mockBookings];
    
    if (searchParams?.status) {
      bookings = bookings.filter(b => b.status === searchParams.status);
    }
    
    if (searchParams?.userId) {
      bookings = bookings.filter(b => b.user.id === searchParams.userId);
    }
    
    if (searchParams?.placeId) {
      bookings = bookings.filter(b => b.place.id === searchParams.placeId);
    }
    
    return of({ content: bookings, totalElements: bookings.length });
  }

  getAllDocuments(searchParams?: any): Observable<{ content: Document[], totalElements: number }> {
    let documents = [...this.mockDocuments];
    
    if (searchParams?.status) {
      documents = documents.filter(d => d.status === searchParams.status);
    }
    
    return of({ content: documents, totalElements: documents.length });
  }

  // Mock Manager document review
  acceptDocument(id: number, comment?: string): Observable<Document> {
    const index = this.mockDocuments.findIndex(d => d.id === id);
    if (index !== -1) {
      this.mockDocuments[index].status = DocumentStatus.ACCEPTED;
      this.mockDocuments[index].reviewedAt = new Date().toISOString();
      if (comment) {
        this.mockDocuments[index].comment = comment;
      }
      return of(this.mockDocuments[index]);
    }
    throw new Error('Document not found');
  }

  rejectDocument(id: number, comment: string): Observable<Document> {
    const index = this.mockDocuments.findIndex(d => d.id === id);
    if (index !== -1) {
      this.mockDocuments[index].status = DocumentStatus.REJECTED;
      this.mockDocuments[index].reviewedAt = new Date().toISOString();
      this.mockDocuments[index].comment = comment;
      return of(this.mockDocuments[index]);
    }
    throw new Error('Document not found');
  }

  // Mock Operator endpoints
  getDocumentRejections(): Observable<Document[]> {
    const rejectedDocs = this.mockDocuments.filter(d => d.status === DocumentStatus.REJECTED);
    return of(rejectedDocs);
  }
}