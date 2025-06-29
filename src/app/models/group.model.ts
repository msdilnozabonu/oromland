export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  BOTH = 'BOTH'
}

export interface Group {
  id: number;
  placeId: number;
  gender: Gender;
  ageRangeStart: number;
  ageRangeEnd: number;
  totalCapacity: number;
  availableSpots: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupRequest {
  placeId: number;
  gender: Gender;
  ageRangeStart: number;
  ageRangeEnd: number;
  totalCapacity: number;
}

export interface UpdateGroupRequest {
  gender?: Gender;
  ageRangeStart?: number;
  ageRangeEnd?: number;
  totalCapacity?: number;
}