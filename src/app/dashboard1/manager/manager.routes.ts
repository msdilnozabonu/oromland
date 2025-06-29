import { Routes } from '@angular/router';

export const managerRoutes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full'
  },
  {
    path: 'overview',
    loadComponent: () => import('./overview/overview.component').then(m => m.OverviewComponent)
  }
];