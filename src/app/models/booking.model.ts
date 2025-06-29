export interface Booking {
  id: number;
  userId: number;
  placeId: number;
  groupId: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  children: Child[];
  totalAmount?: number;
  paymentStatus?: PaymentStatus;
  
  // Relations
  user?: any;
  place?: any;
  group?: any;
  documents?: Document[];
}

export interface Child {
  id: number;
  userId: number;
  campId: number;
  fullName: string;
  gender: Gender;
  birthDate: string;
  createdAt: string;
  relationship: Relationship;
  documents?: ChildDocument[];
}

export interface ChildDocument {
  id: number;
  childId: number;
  fileName: string;
  fileType: string;
  filePath: string;
  uploadDate: string;
  documentId: number;
}

export interface Document {
  id: number;
  userId: number;
  campId: number;
  status: DocumentStatus;
  comment: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum Relationship {
  SON = 'SON',
  DAUGHTER = 'DAUGHTER',
  HUSBAND = 'HUSBAND',
  WIFE = 'WIFE',
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
  SELF = 'SELF'
}

export interface CreateBookingRequest {
  placeId: number;
  groupId: number;
  children: {
    fullName: string;
    gender: string;
    birthDate: string;
    relationship: string;
  }[];
}