import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { 
  User, 
  UserRole, 
  Gender as UserGender, 
  Permission 
} from '../models/user.model';
import { 
  Place, 
  City, 
  Group, 
  PlaceType, 
  Gender, 
  Season,
  Amenity
} from '../models/place.model';
import { Feedback } from '../models/feedback.model';
import { Booking, BookingStatus } from '../models/booking.model';
import { Document, DocumentStatus } from '../models/document.model';
import { Child, Relationship } from '../models/child.model';

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
  public readonly amenities: Amenity[] = [
    { id: 1, name: 'WiFi', icon: 'wifi' },
    { id: 2, name: 'Pool', icon: 'pool' },
    { id: 3, name: 'Restaurant', icon: 'restaurant' },
    { id: 4, name: 'Gym', icon: 'fitness_center' },
    { id: 5, name: 'Spa', icon: 'spa' },
    { id: 6, name: 'Medical Care', icon: 'medical_services' },
    { id: 7, name: 'Parking', icon: 'local_parking' },
    { id: 8, name: 'Air Conditioning', icon: 'ac_unit' },
    { id: 9, name: 'Laundry', icon: 'local_laundry_service' },
    { id: 10, name: 'Playground', icon: 'child_friendly' }
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
      amenities: [1, 2, 3, 8], // WiFi, Pool, Restaurant, AC
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
      ]
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
      amenities: [3, 4, 5, 6], // Restaurant, Gym, Spa, Medical Care
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
      ]
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
      startDate: `${this.currentYear}-06-01`,
      endDate: `${this.currentYear}-08-31`,
      price: 1200,
      description: 'Summer adventure program for young adults',
      schedule: [
        { day: 'Monday', activity: 'Hiking' },
        { day: 'Wednesday', activity: 'Rock climbing' },
        { day: 'Friday', activity: 'Team building' }
      ]
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
      startDate: `${this.currentYear}-05-15`,
      endDate: `${this.currentYear}-10-15`,
      price: 1800,
      description: 'Family wellness and health improvement program',
      schedule: [
        { day: 'Daily', activity: 'Morning exercises' },
        { day: 'Tuesday/Thursday', activity: 'Nutrition workshops' },
        { day: 'Saturday', activity: 'Family activities' }
      ]
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
      role: UserRole.ADMIN,
      permissions: [
        Permission.MANAGE_USERS,
        Permission.MANAGE_PLACES,
        Permission.MANAGE_BOOKINGS,
        Permission.MANAGE_DOCUMENTS
      ],
      gender: UserGender.MALE,
      birthDate: '1990-01-01',
      phoneNumber: '+998901234567',
      isActive: true,
      lastLogin: '2024-02-15T09:30:00Z',
      createdAt: '2023-01-01T00:00:00Z'
    },
    {
      userId: 2,
      username: 'user',
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@oromland.com',
      role: UserRole.USER,
      permissions: [
        Permission.VIEW_PROFILE,
        Permission.CREATE_BOOKING,
        Permission.MANAGE_CHILDREN
      ],
      gender: UserGender.MALE,
      birthDate: '1995-05-15',
      phoneNumber: '+998901234568',
      isActive: true,
      lastLogin: '2024-02-14T15:45:00Z',
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
      relationship: Relationship.CHILD,
      medicalInfo: 'No known allergies',
      specialNeeds: 'None',
      createdAt: '2023-06-01T00:00:00Z'
    },
    {
      id: 2,
      userId: 2,
      fullName: 'Bob User',
      birthDate: '2018-07-22',
      gender: Gender.MALE,
      relationship: Relationship.CHILD,
      medicalInfo: 'Peanut allergy',
      specialNeeds: 'Requires epinephrine auto-injector',
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
      startDate: `${this.currentYear}-07-01`,
      endDate: `${this.currentYear}-07-15`,
      status: BookingStatus.CONFIRMED,
      totalAmount: 1800,
      paymentStatus: 'PAID',
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z',
      children: [1], // Alice User
      documents: [1, 2] // Passport and medical form
    }
  ];

  // Mock Documents
  public readonly documents: Document[] = [
    {
      id: 1,
      userId: 2,
      childId: 1,
      type: 'PASSPORT',
      fileName: 'passport_alice_user.pdf',
      fileType: 'application/pdf',
      status: DocumentStatus.APPROVED,
      uploadedAt: '2024-01-05T10:15:00Z',
      reviewedAt: '2024-01-08T11:30:00Z',
      reviewerId: 3,
      comment: 'Document approved'
    },
    {
      id: 2,
      userId: 2,
      childId: 1,
      type: 'MEDICAL_FORM',
      fileName: 'medical_form_alice_user.pdf',
      fileType: 'application/pdf',
      status: DocumentStatus.PENDING,
      uploadedAt: '2024-01-05T10:20:00Z'
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
      updatedAt: `${this.currentYear}-07-20T16:45:00Z`,
      response: {
        text: 'Thank you for your feedback! We are happy you enjoyed your stay.',
        respondedAt: `${this.currentYear}-07-21T10:30:00Z`,
        responderId: 3
      }
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
    amenities?: number[];
  }): Observable<Place[]> {
    let results = [...this.places];
    
    if (params.cityId) {
      results = results.filter(p => p.cityId === params.cityId);
    }
    
    if (params.type) {
      results = results.filter(p => p.type === params.type);
    }
    
    if (params.minPrice) {
      results = results.filter(p => p.price >= params.minPrice);
    }
    
    if (params.maxPrice) {
      results = results.filter(p => p.price <= params.maxPrice);
    }
    
    if (params.amenities && params.amenities.length > 0) {
      results = results.filter(p => 
        params.amenities!.every(a => p.amenities.includes(a))
      );
    }
    
    return of(results);
  }
}