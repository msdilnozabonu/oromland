import { Gender } from './group.model';

export enum ChildRelationship {
  SON = 'SON',
  DAUGHTER = 'DAUGHTER',
  BROTHER = 'BROTHER',
  SISTER = 'SISTER',
  NEPHEW = 'NEPHEW',
  NIECE = 'NIECE',
  GRANDSON = 'GRANDSON',
  GRANDDAUGHTER = 'GRANDDAUGHTER',
  OTHER = 'OTHER'
}

export interface Child {
  id: number;
  userId: number;
  bookingId: number;
  fullName: string;
  gender: Gender;
  birthDate: string;
  relationship: ChildRelationship;
  createdAt: string;
}

export interface CreateChildRequest {
  fullName: string;
  gender: Gender;
  birthDate: string;
  relationship: ChildRelationship;
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