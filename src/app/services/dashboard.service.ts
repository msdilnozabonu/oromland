import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserRole } from '../models/user.model';

export interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  exact?: boolean;
  children?: NavigationItem[];
  permission?: string;
}

export interface DashboardConfig {
  displayName: string;
  navigationItems: NavigationItem[];
  defaultRoute: string;
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private dashboardConfigs: { [key in UserRole]?: DashboardConfig } = {};
  private cachedConfigs = new Map<UserRole, DashboardConfig>();
  private apiUrl = `${environment.apiUrl}/dashboard/config`;

  constructor(private http: HttpClient) {
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs(): void {
    this.dashboardConfigs = {
      [UserRole.SUPER_ADMIN]: {
        displayName: 'Super Administrator',
        defaultRoute: '/dashboard/super-admin/overview',
        permissions: ['*'],
        navigationItems: [
          {
            label: 'Overview',
            icon: 'dashboard',
            route: '/dashboard/super-admin/overview',
            exact: true
          },
          {
            label: 'Users',
            icon: 'people',
            route: '/dashboard/super-admin/users',
            permission: 'manage_users'
          },
          {
            label: 'Sanatoriums',
            icon: 'spa',
            route: '/dashboard/super-admin/sanatoriums',
            permission: 'manage_sanatoriums'
          },
          {
            label: 'Camps',
            icon: 'forest',
            route: '/dashboard/super-admin/camps',
            permission: 'manage_camps'
          },
          {
            label: 'Bookings',
            icon: 'book_online',
            route: '/dashboard/super-admin/bookings',
            permission: 'manage_bookings',
            children: [
              {
                label: 'Sanatoriums',
                icon: 'spa',
                route: '/dashboard/super-admin/bookings/sanatoriums'
              },
              {
                label: 'Camps',
                icon: 'forest',
                route: '/dashboard/super-admin/bookings/camps'
              }
            ]
          }
        ]
      },
      [UserRole.ADMIN]: {
        displayName: 'Administrator',
        defaultRoute: '/dashboard/admin/overview',
        permissions: ['manage_camps', 'manage_sanatoriums', 'manage_users', 'manage_bookings'],
        navigationItems: [
          {
            label: 'Overview',
            icon: 'dashboard',
            route: '/dashboard/admin/overview',
            exact: true
          },
          {
            label: 'Sanatoriums',
            icon: 'spa',
            route: '/dashboard/admin/sanatoriums',
            permission: 'manage_sanatoriums'
          },
          {
            label: 'Camps',
            icon: 'forest',
            route: '/dashboard/admin/camps',
            permission: 'manage_camps'
          },
          {
            label: 'Bookings',
            icon: 'book_online',
            route: '/dashboard/admin/bookings',
            permission: 'manage_bookings'
          }
        ]
      },
      [UserRole.MANAGER]: {
        displayName: 'Manager',
        defaultRoute: '/dashboard/manager/overview',
        permissions: ['manage_assigned_places', 'manage_documents', 'view_bookings'],
        navigationItems: [
          {
            label: 'Overview',
            icon: 'dashboard',
            route: '/dashboard/manager/overview',
            exact: true
          },
          {
            label: 'Vacancies',
            icon: 'work',
            route: '/dashboard/manager/vacancies',
            permission: 'manage_vacancies'
          },
          {
            label: 'Documents',
            icon: 'description',
            route: '/dashboard/manager/documents',
            permission: 'manage_documents'
          }
        ]
      },
      [UserRole.OPERATOR]: {
        displayName: 'Operator',
        defaultRoute: '/dashboard/operator/overview',
        permissions: ['manage_documents', 'manage_feedbacks', 'view_users'],
        navigationItems: [
          {
            label: 'Overview',
            icon: 'dashboard',
            route: '/dashboard/operator/overview',
            exact: true
          },
          {
            label: 'Documents',
            icon: 'description',
            route: '/dashboard/operator/documents',
            permission: 'manage_documents'
          },
          {
            label: 'Feedbacks',
            icon: 'feedback',
            route: '/dashboard/operator/feedbacks',
            permission: 'manage_feedbacks'
          }
        ]
      },
      [UserRole.USER]: {
        displayName: 'User',
        defaultRoute: '/dashboard/user/overview',
        permissions: ['view_own_data', 'create_bookings', 'manage_children'],
        navigationItems: [
          {
            label: 'Overview',
            icon: 'dashboard',
            route: '/dashboard/user/overview',
            exact: true
          },
          {
            label: 'Profile',
            icon: 'person',
            route: '/dashboard/user/profile'
          },
          {
            label: 'Bookings',
            icon: 'book_online',
            route: '/dashboard/user/bookings',
            permission: 'view_bookings'
          },
          {
            label: 'Children',
            icon: 'child_care',
            route: '/dashboard/user/children',
            permission: 'manage_children'
          }
        ]
      }
    };
  }

  getDashboardConfig(role: UserRole, forceRefresh = false): Observable<DashboardConfig> {
    // Check cache first
    if (!forceRefresh && this.cachedConfigs.has(role)) {
      return of(this.cachedConfigs.get(role)!);
    }

    // Try to get from backend first
    return this.http.get<DashboardConfig>(`${this.apiUrl}/${role}`).pipe(
      tap(config => this.cachedConfigs.set(role, config)),
      catchError(() => {
        // Fall back to local config if API fails
        const localConfig = this.dashboardConfigs[role];
        if (localConfig) {
          this.cachedConfigs.set(role, localConfig);
          return of(localConfig);
        }
        return throwError(() => new Error(`No dashboard configuration found for role ${role}`));
      })
    );
  }

  getNavigationItems(role: UserRole, permissions: string[] = []): Observable<NavigationItem[]> {
    return this.getDashboardConfig(role).pipe(
      map(config => {
        return this.filterItemsByPermission(config.navigationItems, permissions);
      })
    );
  }

  private filterItemsByPermission(items: NavigationItem[], permissions: string[]): NavigationItem[] {
    return items
      .filter(item => !item.permission || permissions.includes('*') || permissions.includes(item.permission))
      .map(item => {
        if (item.children) {
          return {
            ...item,
            children: this.filterItemsByPermission(item.children, permissions)
          };
        }
        return item;
      })
      .filter(item => !item.children || item.children.length > 0); // Remove parent items with no visible children
  }

  getDefaultRoute(role: UserRole): Observable<string> {
    return this.getDashboardConfig(role).pipe(
      map(config => config.defaultRoute)
    );
  }

  hasPermission(role: UserRole, permission: string): Observable<boolean> {
    return this.getDashboardConfig(role).pipe(
      map(config => config.permissions.includes('*') || config.permissions.includes(permission))
    );
  }

  updateBadgeCount(role: UserRole, route: string, count: number): void {
    this.getDashboardConfig(role).subscribe(config => {
      const updateItem = (items: NavigationItem[]): boolean => {
        for (const item of items) {
          if (item.route === route) {
            item.badge = count;
            return true;
          }
          if (item.children && updateItem(item.children)) {
            return true;
          }
        }
        return false;
      };

      if (updateItem(config.navigationItems)) {
        this.cachedConfigs.set(role, config);
      }
    });
  }
}