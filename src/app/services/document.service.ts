import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Document, DocumentStatus } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  // Mock data
  private mockDocuments: Document[] = [];
  private nextDocumentId = 1;

  constructor() {}

  getUserDocuments(): Observable<Document[]> {
    return of(this.mockDocuments);
  }

  getBookingDocuments(bookingId: number): Observable<Document[]> {
    const bookingDocs = this.mockDocuments.filter(d => d.bookingId === bookingId);
    return of(bookingDocs);
  }

  uploadDocument(formData: FormData): Observable<Document> {
    const file = formData.get('file') as File;
    const bookingId = formData.get('bookingId') as string;
    
    const newDocument: Document = {
      id: this.nextDocumentId++,
      userId: 1,
      fileName: file?.name || 'document.pdf',
      fileType: file?.type || 'application/pdf',
      filePath: 'mock-path/' + (file?.name || 'document.pdf'),
      status: DocumentStatus.PENDING,
      bookingId: bookingId ? parseInt(bookingId) : 1,
      uploadDate: new Date().toISOString(),
      submittedAt: new Date().toISOString()
    };
    
    this.mockDocuments.push(newDocument);
    return of(newDocument);
  }

  deleteDocument(documentId: number): Observable<void> {
    const index = this.mockDocuments.findIndex(d => d.id === documentId);
    if (index !== -1) {
      this.mockDocuments.splice(index, 1);
      return of(void 0);
    }
    throw new Error('Document not found');
  }

  approveDocument(documentId: number, comment?: string): Observable<Document> {
    const index = this.mockDocuments.findIndex(d => d.id === documentId);
    if (index !== -1) {
      this.mockDocuments[index].status = DocumentStatus.ACCEPTED;
      this.mockDocuments[index].reviewedAt = new Date().toISOString();
      this.mockDocuments[index].comment = comment;
      return of(this.mockDocuments[index]);
    }
    throw new Error('Document not found');
  }

  rejectDocument(documentId: number, comment: string): Observable<Document> {
    const index = this.mockDocuments.findIndex(d => d.id === documentId);
    if (index !== -1) {
      this.mockDocuments[index].status = DocumentStatus.REJECTED;
      this.mockDocuments[index].reviewedAt = new Date().toISOString();
      this.mockDocuments[index].comment = comment;
      return of(this.mockDocuments[index]);
    }
    throw new Error('Document not found');
  }
}