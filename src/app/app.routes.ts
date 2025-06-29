import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UserRole } from './models/user.model';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contacts',
    loadComponent: () => import('./contacts/contacts.component').then(m => m.ContactsComponent)
  },
  {
    path: 'vacancies',
    loadComponent: () => import('./vacancies/vacancies.component').then(m => m.VacanciesComponent)
  },

  // Camps routes
  {
    path: 'camps',
    loadComponent: () => import('./components/city-selection/city-selection.component').then(m => m.CitySelectionComponent),
    data: { type: 'CAMP' }
  },
  {
    path: 'camps/:cityId',
    loadComponent: () => import('./components/place-list/place-list.component').then(m => m.PlaceListComponent),
    data: { type: 'CAMP' }
  },
  {
    path: 'camps/:cityId/:campId',
    loadComponent: () => import('./components/place-detail/place-detail.component').then(m => m.PlaceDetailComponent),
    data: { type: 'CAMP' }
  },

  // Sanatoriums routes
  {
    path: 'sanatoriums',
    loadComponent: () => import('./components/city-selection/city-selection.component').then(m => m.CitySelectionComponent),
    data: { type: 'SANATORIUM' }
  },
  {
    path: 'sanatoriums/:cityId',
    loadComponent: () => import('./components/place-list/place-list.component').then(m => m.PlaceListComponent),
    data: { type: 'SANATORIUM' }
  },
  {
    path: 'sanatoriums/:cityId/:sanatoriumId',
    loadComponent: () => import('./components/place-detail/place-detail.component').then(m => m.PlaceDetailComponent),
    data: { type: 'SANATORIUM' }
  },

  // Dashboard1 routes with new layout
  {
    path: 'dashboard1',
    loadComponent: () => import('./dashboard1/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'super-admin',
        loadChildren: () => import('./dashboard1/super-admin/super-admin.routes').then(m => m.superAdminRoutes),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.SUPER_ADMIN] }
      },
      {
        path: 'admin',
        loadChildren: () => import('./dashboard1/admin/admin.routes').then(m => m.adminRoutes),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.ADMIN] }
      },
      {
        path: 'manager',
        loadChildren: () => import('./dashboard1/manager/manager.routes').then(m => m.managerRoutes),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.MANAGER] }
      },
      {
        path: 'operator',
        loadChildren: () => import('./dashboard1/operator/operator.routes').then(m => m.operatorRoutes),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.OPERATOR] }
      },
      {
        path: 'user',
        loadChildren: () => import('./dashboard1/user/user.routes').then(m => m.userRoutes),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.USER] }
      },
      {
        path: '',
        redirectTo: 'user',
        pathMatch: 'full'
      }
    ]
  },



  // Wildcard route
  {
    path: '**',
    loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
