export interface City {
  id: number;
  name: string;
}

export interface Location {
  id: number;
  latitude: number;
  longitude: number;
}

export interface Place {
  id: number;
  name: string;
  description: Map<Language, string> | { [key: string]: string };
  cityId: number;
  locationId: number;
  type: PlaceType;
  availableSeasons: Season[];
  createdBy: number;
  city?: City;
  location?: Location;
  groups?: Group[];
  images?: string[];
  price?: number;
  rating?: number;
  amenities?: string[];
  // Additional detailed fields
  fullLocation?: string;
  ageRange?: string;
  features?: string[];
  shortDescription?: string;
}

export interface Group {
  id: number;
  placeId: number;
  gender: Gender;
  ageRangeStart: number;
  ageRangeEnd: number;
  totalCapacity: number;
  availableSpots: number;
  createdAt?: string;
  updatedAt?: string;
}

export enum PlaceType {
  CAMP = 'CAMP',
  SANATORIUM = 'SANATORIUM'
}

export enum Season {
  SPRING = 'SPRING',
  SUMMER = 'SUMMER',
  AUTUMN = 'AUTUMN',
  WINTER = 'WINTER'
}

export enum Language {
  UZ = 'uz',
  RU = 'ru',
  EN = 'en'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  BOTH = 'BOTH'
}