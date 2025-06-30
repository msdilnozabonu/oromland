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
  APPROVED = 'APPROVED',
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

// New models for Camp and Sanatorium bookings

export interface BookingCampDTO {
  id?: number;
  // Child information
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  documentNumber: string;
  address: string;
  // Guardian information
  guardianFirstName: string;
  guardianLastName: string;
  guardianPhone: string;
  guardianDocument: string;
  guardianJob: string;
  // Health and files
  healthNoteFilePath?: number;
  birthCertificateFilePath?: number;
  photoFilePath?: number;
  parentPassportFile?: number;
  guardianPermissionFilePath?: number;
  privilegeDocumentPath?: number;
  documentStatus?: DocumentStatus;
}

export interface BookingSanatorium {
  id?: number;
  user?: any;
  sanatoriumId?: any;
  startDate: string;
  endDate: string;
  durationDays: number;
  totalPrice: number;
  status: DocumentStatus;
  // Documents
  passportCopy?: Attachment;
  medicalForm086?: Attachment;
  vaccinationCard?: Attachment;
  photo?: Attachment;
  givenDocumentByWorkplace?: Attachment;
}

export interface Attachment {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadDate: string;
}

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  newBookingsThisMonth: number;
}

export interface DashboardData {
  user: any;
  stats: BookingStats;
  recentBookings: Booking[];
  isNewUser: boolean;
}