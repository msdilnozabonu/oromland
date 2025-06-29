import { Routes } from '@angular/router';

export const operatorRoutes: Routes = [
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