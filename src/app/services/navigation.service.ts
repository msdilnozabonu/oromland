import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { BookingService } from './booking.service';

export interface RedirectData {
  type: 'camp' | 'sanatorium';
  id: number;
  name: string;
  imageUrl?: string;
  price?: number;
  location?: string;
  description?: string;
  features?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(
    private router: Router,
    private authService: AuthService,
    private bookingService: BookingService
  ) {}

  /**
   * Navigate to booking page with pre-filled data
   * If user is not authenticated, redirect to login first
   */
  navigateToBooking(data: RedirectData): void {
    if (!this.authService.isAuthenticated()) {
      // Store the selected place data for later use
      this.bookingService.setSelectedPlace(data);
      
      // Redirect to login with return URL
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/dashboard1/user/${data.type === 'camp' ? 'book-camp' : 'book-sanatorium'}` }
      });
    } else {
      // User is authenticated, go directly to booking page
      this.bookingService.setSelectedPlace(data);
      this.router.navigate([`/dashboard1/user/${data.type === 'camp' ? 'book-camp' : 'book-sanatorium'}`]);
    }
  }

  /**
   * Get stored place data and clear it
   */
  getSelectedPlaceData(): RedirectData | null {
    return this.bookingService.getSelectedPlace();
  }

  /**
   * Navigate to specific dashboard section after login
   */
  navigateAfterLogin(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.role) {
      const dashboardRoute = this.authService.getDashboardRoute();
      
      // Check if there's a stored place to redirect to booking
      const selectedPlace = this.getSelectedPlaceData();
      if (selectedPlace) {
        const bookingRoute = selectedPlace.type === 'camp' ? 'book-camp' : 'book-sanatorium';
        this.router.navigate([`${dashboardRoute}/${bookingRoute}`]);
      } else {
        this.router.navigate([dashboardRoute]);
      }
    }
  }

  /**
   * Navigate to booking from main pages (camps/sanatoriums)
   */
  bookFromMainPage(placeType: 'camp' | 'sanatorium', placeData: any): void {
    const redirectData: RedirectData = {
      type: placeType,
      id: placeData.id,
      name: placeData.name || placeData.title,
      imageUrl: placeData.imageUrl || placeData.image,
      price: placeData.price,
      location: placeData.location,
      description: placeData.description,
      features: placeData.features || placeData.amenities
    };

    this.navigateToBooking(redirectData);
  }

  /**
   * Handle image URL - return from database or fallback to default
   */
  getImageUrl(imagePath: string | null | undefined, type: 'camp' | 'sanatorium'): string {
    if (imagePath && imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath) {
      return `https://oromland.uz/api/files/${imagePath}`;
    }
    
    // Default images based on type
    const defaultImages = {
      camp: '/assets/images/camp-default.jpg',
      sanatorium: '/assets/images/sanatorium-default.jpg'
    };
    
    return defaultImages[type];
  }

  /**
   * Navigate to different sections from burger menu
   */
  navigateFromBurgerMenu(section: string): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const dashboardBase = this.authService.getDashboardRoute();
    
    switch (section) {
      case 'camps':
        this.router.navigate(['/camps']);
        break;
      case 'sanatoriums':
        this.router.navigate(['/sanatoriums']);
        break;
      case 'bookings':
        this.router.navigate([`${dashboardBase}/bookings`]);
        break;
      case 'profile':
        this.router.navigate([`${dashboardBase}/profile`]);
        break;
      case 'reviews':
        this.router.navigate([`${dashboardBase}/reviews`]);
        break;
      case 'book-camp':
        this.router.navigate([`${dashboardBase}/book-camp`]);
        break;
      case 'book-sanatorium':
        this.router.navigate([`${dashboardBase}/book-sanatorium`]);
        break;
      default:
        this.router.navigate([dashboardBase]);
    }
  }
}