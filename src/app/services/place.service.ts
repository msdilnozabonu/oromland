import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  Place, 
  City, 
  Group, 
  PlaceType, 
  Gender, 
  Season 
} from '../models/place.model';
import { MockDataService } from './mock-data.service';

export interface PlaceSearchParams {
  cityId?: number;
  type?: PlaceType;
  gender?: Gender;
  age?: number;
  season?: Season;
  page?: number;
  size?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PlaceService {
  private apiUrl = `${environment.apiUrl}/places`;
  private useMockData = false;

  constructor(private http: HttpClient, private mockDataService: MockDataService) {
    this.checkBackendAvailability().subscribe(available => {
      this.useMockData = !available;
      if (this.useMockData) {
        console.warn('Using mock data - backend unavailable');
      }
    });
  }

  private checkBackendAvailability(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/health`, { observe: 'response' }).pipe(
      map(response => response.status === 200),
      catchError(() => of(false))
    );
  }

  // Cities
  getCities(): Observable<City[]> {
    if (this.useMockData) {
      return of(this.mockDataService.cities);
    }
    return this.http.get<City[]>(`${environment.apiUrl}/cities`).pipe(
      catchError(() => of(this.mockDataService.cities))
    );
  }

  // Places
  getTopPlaces(): Observable<Place[]> {
    if (this.useMockData) {
      return of(this.mockDataService.places.slice(0, 4)); // Return first 4 as "top"
    }
    return this.http.get<Place[]>(`${this.apiUrl}/top`).pipe(
      catchError(() => of(this.mockDataService.places.slice(0, 4)))
    );
  }

  getAllPlaces(): Observable<Place[]> {
    if (this.useMockData) {
      return of(this.mockDataService.places);
    }
    return this.http.get<Place[]>(this.apiUrl).pipe(
      catchError(() => of(this.mockDataService.places))
    );
  }

  getCamps(cityId?: number): Observable<Place[]> {
    if (this.useMockData) {
      let camps = this.mockDataService.places.filter(p => p.type === PlaceType.CAMP);
      if (cityId) {
        camps = camps.filter(p => p.city?.id === cityId);
      }
      return of(camps);
    }

    let params = new HttpParams().set('type', PlaceType.CAMP);
    if (cityId) {
      params = params.set('cityId', cityId.toString());
    }

    return this.http.get<Place[]>(this.apiUrl, { params }).pipe(
      catchError(() => {
        let camps = this.mockDataService.places.filter(p => p.type === PlaceType.CAMP);
        if (cityId) {
          camps = camps.filter(p => p.city?.id === cityId);
        }
        return of(camps);
      })
    );
  }

  getSanatoriums(cityId?: number): Observable<Place[]> {
    if (this.useMockData) {
      let sanatoriums = this.mockDataService.places.filter(p => p.type === PlaceType.SANATORIUM);
      if (cityId) {
        sanatoriums = sanatoriums.filter(p => p.city?.id === cityId);
      }
      return of(sanatoriums);
    }

    let params = new HttpParams().set('type', PlaceType.SANATORIUM);
    if (cityId) {
      params = params.set('cityId', cityId.toString());
    }

    return this.http.get<Place[]>(this.apiUrl, { params }).pipe(
      catchError(() => {
        let sanatoriums = this.mockDataService.places.filter(p => p.type === PlaceType.SANATORIUM);
        if (cityId) {
          sanatoriums = sanatoriums.filter(p => p.city?.id === cityId);
        }
        return of(sanatoriums);
      })
    );
  }

  getPlaceById(id: number): Observable<Place> {
    if (this.useMockData) {
      const place = this.mockDataService.places.find(p => p.id === id);
      if (place) {
        return of(place);
      }
      throw new Error('Place not found');
    }

    return this.http.get<Place>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const place = this.mockDataService.places.find(p => p.id === id);
        if (place) {
          return of(place);
        }
        throw new Error('Place not found');
      })
    );
  }

  // Groups
  getPlaceGroups(placeId: number, searchParams?: PlaceSearchParams): Observable<Group[]> {
    if (this.useMockData) {
      let groups = this.mockDataService.groups.filter(g => g.placeId === placeId);
      
      if (searchParams?.gender && searchParams.gender !== Gender.BOTH) {
        groups = groups.filter(g => g.gender === searchParams.gender || g.gender === Gender.BOTH);
      }
      
      return of(groups);
    }

    let params = new HttpParams();
    if (searchParams?.gender) {
      params = params.set('gender', searchParams.gender);
    }

    return this.http.get<Group[]>(`${this.apiUrl}/${placeId}/groups`, { params }).pipe(
      catchError(() => {
        let groups = this.mockDataService.groups.filter(g => g.placeId === placeId);
        if (searchParams?.gender && searchParams.gender !== Gender.BOTH) {
          groups = groups.filter(g => g.gender === searchParams.gender || g.gender === Gender.BOTH);
        }
        return of(groups);
      })
    );
  }

  // Search
  searchPlaces(searchParams: PlaceSearchParams): Observable<{ content: Place[], totalElements: number }> {
    if (this.useMockData) {
      let places = [...this.mockDataService.places];
      
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

    let params = new HttpParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params = params.append(key, v.toString()));
        } else {
          params = params.set(key, value.toString());
        }
      }
    });

    return this.http.get<{ content: Place[], totalElements: number }>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(() => {
        let places = [...this.mockDataService.places];
        
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
      })
    );
  }

  // Admin endpoints
  createPlace(place: Partial<Place>): Observable<Place> {
    if (this.useMockData) {
      const newPlace: Place = {
        id: this.mockDataService.places.length + 1,
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
        city: place.city || this.mockDataService.cities[0],
        location: place.location || { id: 1, latitude: 41.2995, longitude: 69.2401 },
        images: place.images || [],
        rating: place.rating || 0,
        price: place.price || 100,
        amenities: place.amenities || []
      };
      
      this.mockDataService.places.push(newPlace);
      return of(newPlace);
    }

    return this.http.post<Place>(this.apiUrl, place).pipe(
      catchError(error => {
        throw new Error('Failed to create place');
      })
    );
  }

  updatePlace(id: number, place: Partial<Place>): Observable<Place> {
    if (this.useMockData) {
      const index = this.mockDataService.places.findIndex(p => p.id === id);
      if (index !== -1) {
        this.mockDataService.places[index] = { ...this.mockDataService.places[index], ...place };
        return of(this.mockDataService.places[index]);
      }
      throw new Error('Place not found');
    }

    return this.http.put<Place>(`${this.apiUrl}/${id}`, place).pipe(
      catchError(error => {
        throw new Error('Failed to update place');
      })
    );
  }

  deletePlace(id: number): Observable<void> {
    if (this.useMockData) {
      const index = this.mockDataService.places.findIndex(p => p.id === id);
      if (index !== -1) {
        this.mockDataService.places.splice(index, 1);
        return of(void 0);
      }
      throw new Error('Place not found');
    }

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        throw new Error('Failed to delete place');
      })
    );
  }

  // Group management
  createGroup(group: Partial<Group>): Observable<Group> {
    if (this.useMockData) {
      const newGroup: Group = {
        id: this.mockDataService.groups.length + 1,
        placeId: group.placeId || 1,
        gender: group.gender || Gender.BOTH,
        ageRangeStart: group.ageRangeStart || 18,
        ageRangeEnd: group.ageRangeEnd || 65,
        totalCapacity: group.totalCapacity || 10,
        availableSpots: group.availableSpots || 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.mockDataService.groups.push(newGroup);
      return of(newGroup);
    }

    return this.http.post<Group>(`${this.apiUrl}/${group.placeId}/groups`, group).pipe(
      catchError(error => {
        throw new Error('Failed to create group');
      })
    );
  }

  updateGroup(id: number, group: Partial<Group>): Observable<Group> {
    if (this.useMockData) {
      const index = this.mockDataService.groups.findIndex((g: Group) => g.id === id);
      if (index !== -1) {
        this.mockDataService.groups[index] = { ...this.mockDataService.groups[index], ...group };
        return of(this.mockDataService.groups[index]);
      }
      throw new Error('Group not found');
    }

    return this.http.put<Group>(`${this.apiUrl}/groups/${id}`, group).pipe(
      catchError(error => {
        throw new Error('Failed to update group');
      })
    );
  }

  deleteGroup(id: number): Observable<void> {
    if (this.useMockData) {
      const index = this.mockDataService.groups.findIndex((g: Group) => g.id === id);
      if (index !== -1) {
        this.mockDataService.groups.splice(index, 1);
        return of(void 0);
      }
      throw new Error('Group not found');
    }

    return this.http.delete<void>(`${this.apiUrl}/groups/${id}`).pipe(
      catchError(error => {
        throw new Error('Failed to delete group');
      })
    );
  }
}