import { Injectable } from '@angular/core';
import { UserRole } from '../models/user.model';

export interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  exact?: boolean;
  children?: NavigationItem[];
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
  private dashboardConfigs: { [key: number]: DashboardConfig } = {
    // Super Admin (roleId: 1)
    1: {
      displayName: 'Super Administrator',
      defaultRoute: '/dashboard1/super-admin/overview',
      permissions: ['*'],
      navigationItems: [
        {
          label: 'Overview',
          icon: 'dashboard',
          route: '/dashboard1/super-admin/overview',
          exact: true
        }
      ]
    },
    // Admin (roleId: 2)
    2: {
      displayName: 'Administrator',
      defaultRoute: '/dashboard1/admin/overview',
      permissions: ['manage_camps', 'manage_sanatoriums', 'manage_users', 'manage_bookings'],
      navigationItems: [
        {
          label: 'Overview',
          icon: 'dashboard',
          route: '/dashboard1/admin/overview',
          exact: true
        }
      ]
    },
    // Manager (roleId: 3)
    3: {
      displayName: 'Manager',
      defaultRoute: '/dashboard1/manager/overview',
      permissions: ['manage_assigned_places', 'manage_documents'],
      navigationItems: [
        {
          label: 'Overview',
          icon: 'dashboard',
          route: '/dashboard1/manager/overview',
          exact: true
        }
      ]
    },
    // Operator (roleId: 4)
    4: {
      displayName: 'Operator',
      defaultRoute: '/dashboard1/operator/overview',
      permissions: ['manage_users', 'manage_documents', 'manage_feedbacks'],
      navigationItems: [
        {
          label: 'Overview',
          icon: 'dashboard',
          route: '/dashboard1/operator/overview',
          exact: true
        }
      ]
    },
    // User (roleId: 5)
    5: {
      displayName: 'User',
      defaultRoute: '/dashboard1/user/overview',
      permissions: ['view_own_data', 'create_bookings'],
      navigationItems: [
        {
          label: 'Overview',
          icon: 'dashboard',
          route: '/dashboard1/user/overview',
          exact: true
        }
      ]
    }
  };

  getDashboardConfig(roleId: number): DashboardConfig | null {
    return this.dashboardConfigs[roleId] || null;
  }

  getNavigationItems(roleId: number): NavigationItem[] {
    const config = this.getDashboardConfig(roleId);
    return config ? config.navigationItems : [];
  }

  getDefaultRoute(roleId: number): string {
    const config = this.getDashboardConfig(roleId);
    return config ? config.defaultRoute : '/';
  }

  hasPermission(roleId: number, permission: string): boolean {
    const config = this.getDashboardConfig(roleId);
    if (!config) return false;
    
    return config.permissions.includes('*') || config.permissions.includes(permission);
  }
}