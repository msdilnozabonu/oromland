import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Place, City, Group, PlaceType, Gender, Season } from '../models/place.model';

export interface PlaceSearchParams {
  cityId?: number;
  type?: PlaceType;
  gender?: string;
  age?: number;
  season?: string;
  page?: number;
  size?: number;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlaceService {
  // Mock data
  private mockCities: City[] = [
    { id: 1, name: 'Tashkent' },
    { id: 2, name: 'Samarkand' },
    { id: 3, name: 'Jizzakh' },
    { id: 4, name: 'Navoi' },
    { id: 5, name: 'Bukhara' },
    { id: 6, name: 'Charvak' }
  ];

  private mockPlaces: Place[] = [
    // CAMPS
    {
      id: 1,
      name: 'Dustlik Mount Resort (Summer Camp)',
      description: {
        'uz': 'Tog\'larda xavfsiz va qulay dam olish uchun mo\'ljallangan shaxsiy dam olish maskani',
        'ru': 'Частная зона отдыха в горах для безопасного и комфортного отдыха в лагере',
        'en': 'Private recreation area in the mountains designed for safe and comfortable camp stays'
      },
      shortDescription: 'Mountain summer camp with accommodation and organized activities',
      type: PlaceType.CAMP,
      cityId: 2,
      locationId: 1,
      fullLocation: 'Aman‑Kuton (Urgut District), Samarkand Region',
      availableSeasons: [Season.SUMMER],
      ageRange: 'School-age',
      createdBy: 1,
      city: this.mockCities[1],
      location: { id: 1, latitude: 39.6270, longitude: 66.9750 },
      images: ['/assets/camp1.jpg'],
      rating: 4.5,
      price: 180,
      features: ['Accommodation', 'Organized activities'],
      amenities: ['Mountain Views', 'Safe Environment', 'Activities']
    },
    {
      id: 2,
      name: 'International Kids Summer Camp, Charvak Lake',
      description: {
        'uz': 'Charvak ko\'li yonida ingliz tilida o\'qitiladigan yozgi lager',
        'ru': 'Летний лагерь с английским языком обучения у озера Чарвак',
        'en': 'English-language themed summer camp with engaging activities and excursions'
      },
      shortDescription: 'English-language summer camp with swimming and creative workshops',
      type: PlaceType.CAMP,
      cityId: 6,
      locationId: 2,
      fullLocation: 'Near Charvak Reservoir (~80 km NE of Tashkent)',
      availableSeasons: [Season.SUMMER],
      ageRange: '6–16',
      createdBy: 1,
      city: this.mockCities[5],
      location: { id: 2, latitude: 41.6167, longitude: 70.0833 },
      images: ['/assets/camp3.jpg'],
      rating: 4.8,
      price: 250,
      features: ['English classes', 'Creative workshops', 'Sports', 'Excursions', 'Swimming pools'],
      amenities: ['Lake Access', 'English Classes', 'Swimming Pool', 'Sports']
    },
    {
      id: 3,
      name: 'Sayyod Yurt Camp',
      description: {
        'uz': 'An\'anaviy yurtlarda tog\' manzaralari bilan glamping tajribasi',
        'ru': 'Глэмпинг в традиционных юртах с видом на горы',
        'en': 'Glamping experience in traditional yurts with mountain views'
      },
      shortDescription: 'Year-round glamping in traditional yurts with modern amenities',
      type: PlaceType.CAMP,
      cityId: 3,
      locationId: 3,
      fullLocation: 'Sayyod Village, Forish District, Jizzakh Region',
      availableSeasons: [Season.SPRING, Season.SUMMER, Season.AUTUMN, Season.WINTER],
      ageRange: 'All ages',
      createdBy: 1,
      city: this.mockCities[2],
      location: { id: 3, latitude: 40.1167, longitude: 67.8333 },
      images: ['/assets/camp4.jpg'],
      rating: 4.6,
      price: 200,
      features: ['Swimming pool', 'Restaurant', 'Bar', 'Wi‑Fi', 'Playground', 'Archery', 'Hiking', 'Cycling'],
      amenities: ['Traditional Yurts', 'Mountain Views', 'Swimming Pool', 'Restaurant', 'Wi-Fi']
    },
    {
      id: 4,
      name: 'STEM Summer Camp',
      description: {
        'uz': 'Innovatsiya va o\'rganishni rivojlantiradigan STEM yo\'nalishidagi lager',
        'ru': 'STEM-лагерь, способствующий инновациям и обучению',
        'en': 'STEM-focused camp fostering innovation and learning'
      },
      shortDescription: 'Educational camp focused on science, technology, engineering, and math',
      type: PlaceType.CAMP,
      cityId: 1,
      locationId: 4,
      fullLocation: 'Tashkent',
      availableSeasons: [Season.SUMMER],
      ageRange: '8–15',
      createdBy: 1,
      city: this.mockCities[0],
      location: { id: 4, latitude: 41.2995, longitude: 69.2401 },
      images: ['/assets/camp5.jpg'],
      rating: 4.7,
      price: 220,
      features: ['Science workshops', 'Technology labs', 'Engineering projects', 'Math activities'],
      amenities: ['STEM Labs', 'Educational Programs', 'Innovation Focus']
    },
    {
      id: 5,
      name: 'Rainbow Camp (Aktash)',
      description: {
        'uz': 'Suzish va ochiq havoda o\'yinlar bilan tog\'larda joylashgan lager',
        'ru': 'Лагерь в горах с плаванием и играми на свежем воздухе',
        'en': 'Camp set in the mountains with swimming and outdoor games'
      },
      shortDescription: 'Mountain camp with pool and healthy outdoor activities',
      type: PlaceType.CAMP,
      cityId: 1,
      locationId: 5,
      fullLocation: 'Aktash (mountains)',
      availableSeasons: [Season.SUMMER],
      ageRange: 'School-age',
      createdBy: 1,
      city: this.mockCities[0],
      location: { id: 5, latitude: 41.3995, longitude: 69.3401 },
      images: ['/assets/camp-default.png'],
      rating: 4.4,
      price: 160,
      features: ['Pool', 'Exercise', 'Healthy environment'],
      amenities: ['Swimming Pool', 'Mountain Air', 'Outdoor Games']
    },
    {
      id: 6,
      name: 'Zomin Sunrise Camp',
      description: {
        'uz': 'Manzarali muhitda zamonaviy lager inshootlari',
        'ru': 'Современные лагерные сооружения в живописной обстановке',
        'en': 'Modern camp facilities in a scenic environment'
      },
      shortDescription: 'Modern summer camp with pool and stadium facilities',
      type: PlaceType.CAMP,
      cityId: 3,
      locationId: 6,
      fullLocation: 'Zomin (mountains)',
      availableSeasons: [Season.SUMMER],
      ageRange: 'School-age',
      createdBy: 1,
      city: this.mockCities[2],
      location: { id: 6, latitude: 39.9667, longitude: 68.4000 },
      images: ['/assets/camp-default.png'],
      rating: 4.5,
      price: 170,
      features: ['Pool', 'Stadium', 'Comfortable housing', 'Active games'],
      amenities: ['Swimming Pool', 'Stadium', 'Modern Facilities']
    },

    // SANATORIUMS
    {
      id: 7,
      name: 'Zaamin Sanatorium',
      description: {
        'uz': '2000m balandlikda to\'liq diagnostika va davolash xizmatlari bilan tog\' sog\'lomlashtirish kurort',
        'ru': 'Горный оздоровительный курорт на высоте 2000м с полными диагностическими и лечебными услугами',
        'en': 'Mountain wellness resort at 2,000m altitude with full diagnostic and therapeutic services'
      },
      shortDescription: 'High-altitude mountain sanatorium with comprehensive medical services',
      type: PlaceType.SANATORIUM,
      cityId: 3,
      locationId: 7,
      fullLocation: 'Zaamin National Park, Jizzakh Region',
      availableSeasons: [Season.SPRING, Season.SUMMER, Season.AUTUMN, Season.WINTER],
      ageRange: 'Adults & children',
      createdBy: 1,
      city: this.mockCities[2],
      location: { id: 7, latitude: 39.9500, longitude: 68.4167 },
      images: ['/assets/sanatorium-zamin.png'],
      rating: 4.9,
      price: 300,
      features: ['Diagnostics', 'Medical treatments', 'Pools', 'Sauna', 'Mud therapy'],
      amenities: ['Medical Care', 'High Altitude', 'Spa', 'Diagnostics']
    },
    {
      id: 8,
      name: 'Humson Buloq Sanatorium',
      description: {
        'uz': 'Tog\'li muhitda zamonaviy spa kurort',
        'ru': 'Современный спа-курорт в горной местности',
        'en': 'Modern spa retreat in mountainous surroundings'
      },
      shortDescription: 'Modern spa with indoor/outdoor pools and halal certification',
      type: PlaceType.SANATORIUM,
      cityId: 1,
      locationId: 8,
      fullLocation: 'Yunusabad District, Tashkent',
      availableSeasons: [Season.SPRING, Season.SUMMER, Season.AUTUMN, Season.WINTER],
      ageRange: 'All (3+)',
      createdBy: 1,
      city: this.mockCities[0],
      location: { id: 8, latitude: 41.3500, longitude: 69.2900 },
      images: ['/assets/sanatoriums1.jpg'],
      rating: 4.7,
      price: 280,
      features: ['Indoor/outdoor pools', 'Hydrotherapy', 'Sports fields', 'Halal-certified'],
      amenities: ['Spa', 'Swimming Pools', 'Halal Certified', 'Sports Fields']
    },
    {
      id: 9,
      name: 'Zangiota Zam‑Zam Sanatorium',
      description: {
        'uz': 'Tibbiy diagnostika bilan loy va mineral suv kurort',
        'ru': 'Курорт грязелечения и минеральных вод с медицинской диагностикой',
        'en': 'Mud and mineral water resort with medical diagnostics'
      },
      shortDescription: 'Specialized mud treatment facility with modern medical services',
      type: PlaceType.SANATORIUM,
      cityId: 1,
      locationId: 9,
      fullLocation: 'Urtaaul, Zangiata District, Tashkent Region',
      availableSeasons: [Season.SPRING, Season.SUMMER, Season.AUTUMN, Season.WINTER],
      ageRange: 'Adults',
      createdBy: 1,
      city: this.mockCities[0],
      location: { id: 9, latitude: 41.1500, longitude: 69.1500 },
      images: ['/assets/sanatoriums2.jpg'],
      rating: 4.6,
      price: 260,
      features: ['Mud treatments', 'Medical consultations', 'Modern rooms'],
      amenities: ['Mud Therapy', 'Medical Care', 'Mineral Water']
    },
    {
      id: 10,
      name: 'Tashthemal Sanatorium',
      description: {
        'uz': 'Mineral va loy davolash muassasasi',
        'ru': 'Учреждение минерального и грязевого лечения',
        'en': 'Mineral and mud treatment facility'
      },
      shortDescription: 'Traditional balneotherapy and diagnostic services',
      type: PlaceType.SANATORIUM,
      cityId: 1,
      locationId: 10,
      fullLocation: 'Kuksaray Village, Tashkent District',
      availableSeasons: [Season.SPRING, Season.SUMMER, Season.AUTUMN, Season.WINTER],
      ageRange: 'Adults',
      createdBy: 1,
      city: this.mockCities[0],
      location: { id: 10, latitude: 41.2000, longitude: 69.3000 },
      images: ['/assets/sanatoriums3.jpg'],
      rating: 4.3,
      price: 220,
      features: ['Balneotherapy', 'Diagnostics'],
      amenities: ['Mineral Baths', 'Medical Diagnostics']
    }
  ];

  private mockGroups: Group[] = [
    // Camp groups
    { id: 1, placeId: 1, gender: Gender.BOTH, ageRangeStart: 6, ageRangeEnd: 18, totalCapacity: 40, availableSpots: 20, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 2, placeId: 2, gender: Gender.BOTH, ageRangeStart: 6, ageRangeEnd: 16, totalCapacity: 60, availableSpots: 35, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 3, placeId: 3, gender: Gender.BOTH, ageRangeStart: 5, ageRangeEnd: 65, totalCapacity: 80, availableSpots: 45, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 4, placeId: 4, gender: Gender.BOTH, ageRangeStart: 8, ageRangeEnd: 15, totalCapacity: 30, availableSpots: 18, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 5, placeId: 5, gender: Gender.BOTH, ageRangeStart: 6, ageRangeEnd: 18, totalCapacity: 50, availableSpots: 28, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 6, placeId: 6, gender: Gender.BOTH, ageRangeStart: 6, ageRangeEnd: 18, totalCapacity: 45, availableSpots: 22, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    
    // Sanatorium groups
    { id: 7, placeId: 7, gender: Gender.BOTH, ageRangeStart: 3, ageRangeEnd: 80, totalCapacity: 100, availableSpots: 60, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 8, placeId: 8, gender: Gender.BOTH, ageRangeStart: 3, ageRangeEnd: 80, totalCapacity: 80, availableSpots: 45, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 9, placeId: 9, gender: Gender.BOTH, ageRangeStart: 18, ageRangeEnd: 80, totalCapacity: 60, availableSpots: 35, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 10, placeId: 10, gender: Gender.BOTH, ageRangeStart: 18, ageRangeEnd: 80, totalCapacity: 50, availableSpots: 30, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }
  ];

  constructor() {}

  // Mock implementations
  getCities(): Observable<City[]> {
    return of(this.mockCities);
  }

  getTopPlaces(): Observable<Place[]> {
    return of(this.mockPlaces);
  }

  getAllPlaces(): Observable<Place[]> {
    return of(this.mockPlaces);
  }

  getCamps(cityId?: number): Observable<Place[]> {
    let places = this.mockPlaces.filter(p => p.type === PlaceType.CAMP);
    if (cityId) {
      places = places.filter(p => p.city?.id === cityId);
    }
    return of(places);
  }

  getSanatoriums(cityId?: number): Observable<Place[]> {
    let places = this.mockPlaces.filter(p => p.type === PlaceType.SANATORIUM);
    if (cityId) {
      places = places.filter(p => p.city?.id === cityId);
    }
    return of(places);
  }

  getPlaceById(id: number): Observable<Place> {
    const place = this.mockPlaces.find(p => p.id === id);
    if (place) {
      return of(place);
    }
    throw new Error('Place not found');
  }

  getPlaceGroups(placeId: number, searchParams?: PlaceSearchParams): Observable<Group[]> {
    let groups = this.mockGroups.filter(g => g.placeId === placeId);
    
    if (searchParams?.gender && searchParams.gender !== Gender.BOTH) {
      groups = groups.filter(g => g.gender === searchParams.gender || g.gender === Gender.BOTH);
    }
    
    return of(groups);
  }

  searchPlaces(searchParams: PlaceSearchParams): Observable<{ content: Place[], totalElements: number }> {
    let places = [...this.mockPlaces];
    
    if (searchParams.cityId) {
      places = places.filter(p => p.city?.id === searchParams.cityId);
    }
    
    if (searchParams.type) {
      places = places.filter(p => p.type === searchParams.type);
    }
    
    if (searchParams.search) {
      const search = searchParams.search.toLowerCase();
      places = places.filter(p => {
        const descriptionText = typeof p.description === 'object' 
          ? Object.values(p.description).join(' ') 
          : p.description;
        return p.name.toLowerCase().includes(search) ||
               descriptionText.toLowerCase().includes(search);
      });
    }
    
    return of({ content: places, totalElements: places.length });
  }

  // Admin endpoints - mock implementations
  createPlace(place: Partial<Place>): Observable<Place> {
    const newPlace: Place = {
      id: this.mockPlaces.length + 1,
      name: place.name || 'New Place',
      description: place.description || {
        'uz': 'Yangi joy',
        'ru': 'Новое место',
        'en': 'New Place Description'
      },
      type: place.type || PlaceType.CAMP,
      cityId: place.cityId || 1,
      locationId: place.locationId || 1,
      availableSeasons: place.availableSeasons || [Season.SUMMER],
      createdBy: place.createdBy || 1,
      city: place.city || this.mockCities[0],
      location: place.location || { id: 1, latitude: 41.2995, longitude: 69.2401 },
      images: place.images || [],
      rating: place.rating || 0,
      price: place.price || 100,
      amenities: place.amenities || []
    };
    
    this.mockPlaces.push(newPlace);
    return of(newPlace);
  }

  updatePlace(id: number, place: Partial<Place>): Observable<Place> {
    const index = this.mockPlaces.findIndex(p => p.id === id);
    if (index !== -1) {
      this.mockPlaces[index] = { ...this.mockPlaces[index], ...place };
      return of(this.mockPlaces[index]);
    }
    throw new Error('Place not found');
  }

  deletePlace(id: number): Observable<void> {
    const index = this.mockPlaces.findIndex(p => p.id === id);
    if (index !== -1) {
      this.mockPlaces.splice(index, 1);
      return of(void 0);
    }
    throw new Error('Place not found');
  }

  createGroup(group: Partial<Group>): Observable<Group> {
    const newGroup: Group = {
      id: this.mockGroups.length + 1,
      placeId: group.placeId || 1,
      gender: group.gender || Gender.BOTH,
      ageRangeStart: group.ageRangeStart || 18,
      ageRangeEnd: group.ageRangeEnd || 65,
      totalCapacity: group.totalCapacity || 10,
      availableSpots: group.availableSpots || 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.mockGroups.push(newGroup);
    return of(newGroup);
  }

  updateGroup(id: number, group: Partial<Group>): Observable<Group> {
    const index = this.mockGroups.findIndex(g => g.id === id);
    if (index !== -1) {
      this.mockGroups[index] = { ...this.mockGroups[index], ...group };
      return of(this.mockGroups[index]);
    }
    throw new Error('Group not found');
  }

  deleteGroup(id: number): Observable<void> {
    const index = this.mockGroups.findIndex(g => g.id === id);
    if (index !== -1) {
      this.mockGroups.splice(index, 1);
      return of(void 0);
    }
    throw new Error('Group not found');
  }
}