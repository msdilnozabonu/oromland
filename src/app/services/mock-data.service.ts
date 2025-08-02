import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  User,
  UserRole,
  Gender as UserGender,
  Permission,
  Role
} from '../models/user.model';
import {
  Place,
  City,
  Group,
  PlaceType,
  Gender,
  Season,

} from '../models/place.model';
import { Feedback } from '../models/feedback.model';
import { Booking, BookingStatus, PaymentStatus } from '../models/booking.model';
import { Document, DocumentStatus } from '../models/document.model';
import { Child, ChildRelationship } from '../models/child.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  // Current year for dynamic date generation
  private currentYear = new Date().getFullYear();

  // Mock Cities with additional details
  public readonly cities: City[] = [
    {
      id: 1,
      name: 'Tashkent',
      region: 'Tashkent Region',
      population: 2570000,
      description: 'Capital city of Uzbekistan with modern amenities'
    },
    {
      id: 2,
      name: 'Samarkand',
      region: 'Samarkand Region',
      population: 546000,
      description: 'Ancient city with rich history and cultural heritage'
    },
    {
      id: 3,
      name: 'Bukhara',
      region: 'Bukhara Region',
      population: 280000,
      description: 'Historic city along the Silk Road with well-preserved architecture'
    },
    {
      id: 4,
      name: 'Khiva',
      region: 'Khorezm Region',
      population: 90000,
      description: 'Open-air museum city with ancient walls and monuments'
    },
    {
      id: 5,
      name: 'Fergana',
      region: 'Fergana Region',
      population: 288000,
      description: 'City in the fertile Fergana Valley with traditional crafts'
    }
  ];

  // Available amenities
  public readonly amenities: string[] = [
    'WiFi',
    'Pool',
    'Restaurant',
    'Gym',
    'Spa',
    'Medical Care',
    'Parking',
    'Air Conditioning',
    'Laundry',
    'Playground'
  ];

  // Mock Places with enhanced details
  public readonly places: Place[] = [
    {
      id: 1,
      name: 'Mountain Resort Chimgan',
      description: {
        uz: 'Chimg\'on tog\' kurorti - ajoyib tabiat va dam olish maskani',
        ru: 'Горный курорт Чимган - прекрасное место для отдыха на природе',
        en: 'Chimgan Mountain Resort - wonderful nature retreat'
      },
      type: PlaceType.CAMP,
      cityId: 1,
      locationId: 1, // Added missing property
      location: {
        id: 1,
        latitude: 41.6167,
        longitude: 70.0167,
        address: 'Chimgan Mountains, Tashkent Region'
      },
      availableSeasons: [Season.SUMMER, Season.SPRING, Season.WINTER],
      images: [
        { url: '/assets/images/chimgan1.jpg', alt: 'Chimgan mountain view' },
        { url: '/assets/images/chimgan2.jpg', alt: 'Chimgan ski resort' }
      ],
      rating: 4.5,
      price: 150,
      amenities: ['WiFi', 'Pool', 'Restaurant', 'Air Conditioning'],
      capacity: 200,
      contactPhone: '+998901234567',
      contactEmail: 'info@chimganresort.uz',
      facilities: [
        'Ski equipment rental',
        'Hiking trails',
        'Cable car',
        'Restaurant with local cuisine'
      ],
      rules: [
        'Check-in after 14:00',
        'Check-out before 12:00',
        'No pets allowed',
        'Quiet hours from 23:00 to 07:00'
      ],
      createdBy: 1 // Added missing property
    },
    {
      id: 2,
      name: 'Samarkand Health Sanatorium',
      description: {
        uz: 'Samarqand sog\'lomlashtirish sanatoriysi - zamonaviy tibbiy yordam',
        ru: 'Самаркандский оздоровительный санаторий - современная медицинская помощь',
        en: 'Samarkand Health Sanatorium - modern medical care'
      },
      type: PlaceType.SANATORIUM,
      cityId: 2,
      locationId: 2, // Added missing property
      location: {
        id: 2,
        latitude: 39.6270,
        longitude: 66.9750,
        address: '12 Registan Street, Samarkand'
      },
      availableSeasons: [Season.SUMMER, Season.SPRING, Season.AUTUMN, Season.WINTER],
      images: [
        { url: '/assets/images/samarkand1.jpg', alt: 'Sanatorium building' },
        { url: '/assets/images/samarkand2.jpg', alt: 'Sanatorium spa' }
      ],
      rating: 4.8,
      price: 250,
      amenities: ['Restaurant', 'Gym', 'Spa', 'Medical Care'],
      capacity: 150,
      contactPhone: '+998901234568',
      contactEmail: 'info@samarkandsan.uz',
      facilities: [
        'Diagnostic center',
        'Physical therapy',
        'Mineral water baths',
        'Nutrition counseling'
      ],
      rules: [
        'Medical records required',
        'Doctor consultations daily',
        'Strict meal schedule',
        'Visiting hours 15:00-19:00'
      ],
      createdBy: 1 // Added missing property
    }
  ];

  // Mock Groups with enhanced details
  public readonly groups: Group[] = [
    {
      id: 1,
      name: 'Summer Adventure Group',
      placeId: 1,
      gender: Gender.BOTH,
      ageRangeStart: 18,
      ageRangeEnd: 35,
      totalCapacity: 50,
      availableSpots: 25,
      // startDate: `${this.currentYear}-06-01`, // Removed - not in Group type
      // endDate: `${this.currentYear}-08-31`, // Removed - not in Group type
      // price: 1200, // Removed - not in Group type
      // description: 'Summer adventure program for young adults', // Removed - not in Group type
      // schedule: [ // Removed - not in Group type
      //   { day: 'Monday', activity: 'Hiking' },
      //   { day: 'Wednesday', activity: 'Rock climbing' },
      //   { day: 'Friday', activity: 'Team building' }
      // ]
    },
    {
      id: 2,
      name: 'Family Wellness Program',
      placeId: 2,
      gender: Gender.BOTH,
      ageRangeStart: 5,
      ageRangeEnd: 65,
      totalCapacity: 30,
      availableSpots: 15,
      // startDate: `${this.currentYear}-05-15`, // Removed - not in Group type
      // endDate: `${this.currentYear}-10-15`, // Removed - not in Group type
      // price: 1800, // Removed - not in Group type
      // description: 'Family wellness and health improvement program', // Removed - not in Group type
      // schedule: [ // Removed - not in Group type
      //   { day: 'Daily', activity: 'Morning exercises' },
      //   { day: 'Tuesday/Thursday', activity: 'Nutrition workshops' },
      //   { day: 'Saturday', activity: 'Family activities' }
      // ]
    }
  ];

  // Mock Users with enhanced details
  public readonly users: User[] = [
    {
      userId: 1,
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@oromland.com',
      roleId: 2,
      role: { id: 2, name: UserRole.ADMIN, permissions: [Permission.CREATE_ADMIN, Permission.UPDATE_ADMIN, Permission.DELETE_ADMIN, Permission.READ_ADMIN] },
      gender: UserGender.MALE,
      birthDate: '1990-01-01',
      phoneNumber: '+998901234567',
      isActive: true,
      // lastLogin: '2024-02-15T09:30:00Z', // Removed - not in User type
      createdAt: '2023-01-01T00:00:00Z'
    },
    {
      userId: 2,
      username: 'user',
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@oromland.com',
      roleId: 5,
      role: { id: 5, name: UserRole.USER, permissions: [Permission.CREATE_USER, Permission.UPDATE_USER, Permission.DELETE_USER, Permission.READ_USER] },
      gender: UserGender.MALE,
      birthDate: '1995-05-15',
      phoneNumber: '+998901234568',
      isActive: true,
      // lastLogin: '2024-02-14T15:45:00Z', // Removed - not in User type
      createdAt: '2023-05-10T00:00:00Z'
    }
  ];

  // Mock Children data
  public readonly children: Child[] = [
    {
      id: 1,
      userId: 2,
      fullName: 'Alice User',
      birthDate: '2015-03-10',
      gender: Gender.FEMALE,
      relationship: ChildRelationship.DAUGHTER,
      bookingId: 1,
      createdAt: '2023-06-01T00:00:00Z'
    },
    {
      id: 2,
      userId: 2,
      fullName: 'Bob User',
      birthDate: '2018-07-22',
      gender: Gender.MALE,
      relationship: ChildRelationship.SON,
      bookingId: 1,
      createdAt: '2023-06-01T00:00:00Z'
    }
  ];

  // Mock Bookings
  public readonly bookings: Booking[] = [
    {
      id: 1,
      userId: 2,
      placeId: 1,
      groupId: 1,
      // startDate: `${this.currentYear}-07-01`, // Removed - not in Booking type
      // endDate: `${this.currentYear}-07-15`, // Removed - not in Booking type
      status: BookingStatus.CONFIRMED,
      totalAmount: 1800,
      paymentStatus: PaymentStatus.PAID,
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z',
      children: [], // Will be populated by references
      documents: [] // Will be populated by references
    }
  ];

  // Mock Documents
  public readonly documents: Document[] = [
    {
      id: 1,
      userId: 2,
      // type: 'PASSPORT', // Removed - not in Document type
      fileName: 'passport_alice_user.pdf',
      fileType: 'application/pdf',
      filePath: '/uploads/documents/passport_alice_user.pdf',
      status: DocumentStatus.ACCEPTED,
      uploadDate: '2024-01-05T10:15:00Z', // Changed from uploadedAt to uploadDate
      submittedAt: '2024-01-05T10:15:00Z',
      reviewedAt: '2024-01-08T11:30:00Z',
      // reviewer: 3, // Removed - expects User object, not number
      comment: 'Document approved'
    },
    {
      id: 2,
      userId: 2,
      fileName: 'medical_form_alice_user.pdf',
      fileType: 'application/pdf',
      filePath: '/uploads/documents/medical_form_alice_user.pdf',
      status: DocumentStatus.PENDING,
      uploadDate: '2024-01-05T10:20:00Z',
      submittedAt: '2024-01-05T10:20:00Z'
    }
  ];

  // Mock Feedbacks with enhanced details
  public readonly feedbacks: Feedback[] = [
    {
      id: 1,
      userId: 2,
      placeId: 1,
      bookingId: 1,
      rating: 5,
      comment: 'Amazing experience! The staff was very helpful and the facilities were excellent.',
      createdAt: `${this.currentYear}-07-20T16:45:00Z`,
      updatedAt: `${this.currentYear}-07-20T16:45:00Z`
    }
  ];

  // Mock Roles
  public readonly roles: Role[] = [
    {
      id: 1,
      name: UserRole.SUPER_ADMIN,
      permissions: [Permission.CREATE_ROLE, Permission.UPDATE_ROLE, Permission.DELETE_ROLE, Permission.READ_ROLE]
    },
    {
      id: 2,
      name: UserRole.ADMIN,
      permissions: [Permission.CREATE_ADMIN, Permission.UPDATE_ADMIN, Permission.DELETE_ADMIN, Permission.READ_ADMIN]
    },
    {
      id: 3,
      name: UserRole.MANAGER,
      permissions: [Permission.CREATE_MANAGER, Permission.UPDATE_MANAGER, Permission.DELETE_MANAGER, Permission.READ_MANAGER]
    },
    {
      id: 4,
      name: UserRole.OPERATOR,
      permissions: [Permission.CREATE_OPERATOR, Permission.UPDATE_OPERATOR, Permission.DELETE_OPERATOR, Permission.READ_OPERATOR]
    },
    {
      id: 5,
      name: UserRole.USER,
      permissions: [Permission.CREATE_USER, Permission.UPDATE_USER, Permission.DELETE_USER, Permission.READ_USER]
    }
  ];

  constructor() {}

  // Data access methods with observables for API-like behavior
  getCities(): Observable<City[]> {
    return of(this.cities);
  }

  getCityById(id: number): Observable<City | undefined> {
    return of(this.cities.find(c => c.id === id));
  }

  getPlaces(): Observable<Place[]> {
    return of(this.places);
  }

  getPlaceById(id: number): Observable<Place | undefined> {
    return of(this.places.find(p => p.id === id));
  }

  getPlacesByType(type: PlaceType): Observable<Place[]> {
    return of(this.places.filter(p => p.type === type));
  }

  getPlacesByCity(cityId: number): Observable<Place[]> {
    return of(this.places.filter(p => p.cityId === cityId));
  }

  getGroups(): Observable<Group[]> {
    return of(this.groups);
  }

  getGroupsByPlace(placeId: number): Observable<Group[]> {
    return of(this.groups.filter(g => g.placeId === placeId));
  }

  getUsers(): Observable<User[]> {
    return of(this.users);
  }

  getUserById(id: number): Observable<User | undefined> {
    return of(this.users.find(u => u.userId === id));
  }

  getChildrenByUser(userId: number): Observable<Child[]> {
    return of(this.children.filter(c => c.userId === userId));
  }

  getBookings(): Observable<Booking[]> {
    return of(this.bookings);
  }

  getBookingsByUser(userId: number): Observable<Booking[]> {
    return of(this.bookings.filter(b => b.userId === userId));
  }

  getDocuments(): Observable<Document[]> {
    return of(this.documents);
  }

  getDocumentsByUser(userId: number): Observable<Document[]> {
    return of(this.documents.filter(d => d.userId === userId));
  }

  getFeedbacks(): Observable<Feedback[]> {
    return of(this.feedbacks);
  }

  getFeedbacksByPlace(placeId: number): Observable<Feedback[]> {
    return of(this.feedbacks.filter(f => f.placeId === placeId));
  }

  // Search methods
  searchPlaces(params: {
    cityId?: number;
    type?: PlaceType;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[]; // Changed from number[] to string[]
  }): Observable<Place[]> {
    let results = [...this.places];

    if (params.cityId) {
      results = results.filter(p => p.cityId === params.cityId);
    }

    if (params.type) {
      results = results.filter(p => p.type === params.type);
    }

    if (params.minPrice !== undefined) { // Added null check
      results = results.filter(p => p.price !== undefined && p.price >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) { // Added null check
      results = results.filter(p => p.price !== undefined && p.price <= params.maxPrice!);
    }

    if (params.amenities && params.amenities.length > 0) {
      results = results.filter(p =>
        p.amenities && params.amenities!.every(a => p.amenities!.includes(a))
      );
    }

    return of(results);
  }
}
