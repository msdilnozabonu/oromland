import { Routes } from '@angular/router';

export const superAdminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full'
  },
  {
    path: 'overview',
    loadComponent: () => import('./overview/overview.component').then(m => m.OverviewComponent)
  },
  {
    path: 'roles',
    loadComponent: () => import('./role-management/role-management.component').then(m => m.RoleManagementComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./overview/overview.component').then(m => m.OverviewComponent) // Placeholder
  },
  {
    path: 'bookings',
    loadComponent: () => import('./overview/overview.component').then(m => m.OverviewComponent) // Placeholder
  },
  {
    path: 'analytics',
    loadComponent: () => import('./overview/overview.component').then(m => m.OverviewComponent) // Placeholder
  }
];