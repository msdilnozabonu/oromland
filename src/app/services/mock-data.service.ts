import { Injectable } from '@angular/core';
import { User, UserRole, Gender as UserGender, Permission } from '../models/user.model';
import { Place, City, Group, PlaceType, Gender, Season } from '../models/place.model';
import { Feedback } from '../models/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  
  // Mock Cities
  public readonly cities: City[] = [
    { id: 1, name: 'Tashkent' },
    { id: 2, name: 'Samarkand' },
    { id: 3, name: 'Bukhara' },
    { id: 4, name: 'Khiva' },
    { id: 5, name: 'Fergana' }
  ];

  // Mock Places
  public readonly places: Place[] = [
    {
      id: 1,
      name: 'Mountain Resort Chimgan',
      description: {
        'uz': 'Chimg\'on tog\' kurort',
        'ru': 'Горный курорт Чимган',
        'en': 'Beautiful mountain resort with great views and fresh air'
      },
      type: PlaceType.CAMP,
      cityId: 1,
      locationId: 1,
      availableSeasons: [Season.SUMMER, Season.SPRING],
      createdBy: 1,
      city: this.cities[0],
      location: { id: 1, latitude: 41.6167, longitude: 70.0167 },
      images: ['/assets/images/chimgan1.jpg', '/assets/images/chimgan2.jpg'],
      rating: 4.5,
      price: 150,
      amenities: ['WiFi', 'Pool', 'Restaurant', 'Hiking Trails', 'Ski Resort']
    },
    {
      id: 2,
      name: 'Samarkand Health Sanatorium',
      description: {
        'uz': 'Samarqand sog\'liqni saqlash sanatoriysi',
        'ru': 'Самаркандский санаторий здоровья',
        'en': 'Modern sanatorium with medical facilities and spa treatments'
      },
      type: PlaceType.SANATORIUM,
      cityId: 2,
      locationId: 2,
      availableSeasons: [Season.SUMMER, Season.SPRING, Season.AUTUMN],
      createdBy: 1,
      city: this.cities[1],
      location: { id: 2, latitude: 39.6270, longitude: 66.9750 },
      images: ['/assets/images/samarkand1.jpg', '/assets/images/samarkand2.jpg'],
      rating: 4.8,
      price: 250,
      amenities: ['Medical Care', 'Spa', 'Gym', 'Library', 'Garden']
    },
    {
      id: 3,
      name: 'Bukhara Desert Camp',
      description: {
        'uz': 'Buxoro cho\'l lageri',
        'ru': 'Бухарский пустынный лагерь',
        'en': 'Unique desert camping experience with traditional yurts'
      },
      type: PlaceType.CAMP,
      cityId: 3,
      locationId: 3,
      availableSeasons: [Season.SPRING, Season.AUTUMN],
      createdBy: 1,
      city: this.cities[2],
      location: { id: 3, latitude: 39.7747, longitude: 64.4286 },
      images: ['/assets/images/bukhara1.jpg', '/assets/images/bukhara2.jpg'],
      rating: 4.2,
      price: 120,
      amenities: ['Traditional Yurts', 'Camel Rides', 'Stargazing', 'Local Cuisine']
    }
  ];

  // Mock Groups
  public readonly groups: Group[] = [
    {
      id: 1,
      placeId: 1,
      gender: Gender.BOTH,
      ageRangeStart: 18,
      ageRangeEnd: 35,
      totalCapacity: 50,
      availableSpots: 25,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      placeId: 2,
      gender: Gender.BOTH,
      ageRangeStart: 25,
      ageRangeEnd: 65,
      totalCapacity: 30,
      availableSpots: 15,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      placeId: 3,
      gender: Gender.BOTH,
      ageRangeStart: 20,
      ageRangeEnd: 45,
      totalCapacity: 20,
      availableSpots: 8,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  // Mock Users
  public readonly users: User[] = [
    {
      userId: 1,
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@oromland.com',
      roleId: 1,
      role: { id: 1, name: UserRole.ADMIN, permissions: [Permission.READ_USER, Permission.CREATE_USER, Permission.UPDATE_USER, Permission.DELETE_USER] },
      gender: UserGender.MALE,
      birthDate: '1990-01-01',
      phoneNumber: '+998901234567',
      isActive: true
    },
    {
      userId: 2,
      username: 'user',
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@oromland.com',
      roleId: 2,
      role: { id: 2, name: UserRole.USER, permissions: [Permission.READ_USER, Permission.CREATE_BOOKING] },
      gender: UserGender.MALE,
      birthDate: '1995-01-01',
      phoneNumber: '+998901234568',
      isActive: true
    },
    {
      userId: 3,
      username: 'manager',
      firstName: 'Manager',
      lastName: 'User',
      email: 'manager@oromland.com',
      roleId: 3,
      role: { id: 3, name: UserRole.MANAGER, permissions: [Permission.READ_DOCUMENT, Permission.UPDATE_DOCUMENT] },
      gender: UserGender.FEMALE,
      birthDate: '1988-05-15',
      phoneNumber: '+998901234569',
      isActive: true
    }
  ];

  // Mock Feedbacks
  public readonly feedbacks: Feedback[] = [
    {
      id: 1,
      userId: 2,
      placeId: 1,
      rating: 5,
      comment: 'Amazing mountain views and excellent facilities! Highly recommended for adventure lovers.',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      user: {
        firstName: 'Regular',
        lastName: 'User'
      },
      place: {
        name: 'Mountain Resort Chimgan',
        type: 'CAMP'
      }
    },
    {
      id: 2,
      userId: 3,
      placeId: 2,
      rating: 4,
      comment: 'Very good medical facilities and professional staff. The spa treatments were relaxing.',
      createdAt: '2024-01-16T14:30:00Z',
      updatedAt: '2024-01-16T14:30:00Z',
      user: {
        firstName: 'Manager',
        lastName: 'User'
      },
      place: {
        name: 'Samarkand Health Sanatorium',
        type: 'SANATORIUM'
      }
    },
    {
      id: 3,
      userId: 2,
      placeId: 3,
      rating: 4,
      comment: 'Unique desert experience! The yurts were comfortable and the stargazing was incredible.',
      createdAt: '2024-01-20T18:45:00Z',
      updatedAt: '2024-01-20T18:45:00Z',
      user: {
        firstName: 'Regular',
        lastName: 'User'
      },
      place: {
        name: 'Bukhara Desert Camp',
        type: 'CAMP'
      }
    }
  ];

  constructor() {}

  // Helper methods
  getCityById(id: number): City | undefined {
    return this.cities.find(city => city.id === id);
  }

  getPlaceById(id: number): Place | undefined {
    return this.places.find(place => place.id === id);
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.userId === id);
  }

  getPlacesByCity(cityId: number): Place[] {
    return this.places.filter(place => place.city?.id === cityId);
  }

  getPlacesByType(type: PlaceType): Place[] {
    return this.places.filter(place => place.type === type);
  }

  getFeedbacksByPlace(placeId: number): Feedback[] {
    return this.feedbacks.filter(feedback => feedback.placeId === placeId);
  }

  getGroupsByPlace(placeId: number): Group[] {
    return this.groups.filter(group => group.placeId === placeId);
  }
}