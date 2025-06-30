import { Routes } from '@angular/router';

export const userRoutes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full'
  },
  {
    path: 'overview',
    loadComponent: () => import('./user-overview/user-overview.component').then(m => m.UserOverviewComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'bookings',
    loadComponent: () => import('./bookings/bookings.component').then(m => m.BookingsComponent)
  },
  {
    path: 'book-camp',
    loadComponent: () => import('./book-camp/book-camp.component').then(m => m.BookCampComponent)
  },
  {
    path: 'book-sanatorium',
    loadComponent: () => import('./book-sanatorium/book-sanatorium.component').then(m => m.BookSanatoriumComponent)
  },
  {
    path: 'reviews',
    loadComponent: () => import('./reviews/reviews.component').then(m => m.ReviewsComponent)
  }
];