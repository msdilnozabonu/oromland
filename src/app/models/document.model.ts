import { Booking } from './booking.model';
import { User } from './user.model';

export enum DocumentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface Document {
  id: number;
  userId: number;
  bookingId?: number;
  fileName: string;
  fileType: string;
  filePath: string;
  status: DocumentStatus;
  comment?: string;
  uploadDate: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
  
  // Relations
  user?: User;
  booking?: Booking;
  reviewer?: User;
}

export interface ChildDocument {
  id: number;
  childId: number;
  documentId: number;
  fileName: string;
  fileType: string;
  filePath: string;
  uploadDate: string;
  
  // Relations
  document?: Document;
}

export interface CreateDocumentRequest {
  bookingId?: number;
  childId?: number;
  file: File;
}

export interface UpdateDocumentRequest {
  status?: DocumentStatus;
  comment?: string;
}