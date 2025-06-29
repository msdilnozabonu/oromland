import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { User, UserRole, Gender, Permission } from '../models/user.model';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  birthDate: string;
  phoneNumber: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private mockUsers: User[] = [
    {
      userId: 1,
      username: 'admin',
      firstName: 'Kamronbek',
      lastName: 'Jumanov',
      email: 'asdfg@gmail.com',
      roleId: 2,
      role: { id: 2, name: UserRole.ADMIN, permissions: [Permission.READ_USER, Permission.CREATE_USER, Permission.UPDATE_USER, Permission.DELETE_USER] },
      gender: Gender.MALE,
      birthDate: '2005-10-10',
      phoneNumber: '+998901234567',
      isActive: true
    },
    {
      userId: 2,
      username: 'super_admin',
      firstName: 'Super',
      lastName: 'Admin',
      email: 'super_admin@gmail.com',
      roleId: 1,
      role: { id: 1, name: UserRole.SUPER_ADMIN, permissions: [Permission.READ_USER, Permission.CREATE_USER, Permission.UPDATE_USER, Permission.DELETE_USER] },
      gender: Gender.MALE,
      birthDate: '2005-10-12',
      phoneNumber: '+9989098765432',
      isActive: true
    },
    {
      userId: 3,
      username: 'manager',
      firstName: 'Super',
      lastName: 'Admin',
      email: 'super@gmail.com',
      roleId: 3,
      role: { id: 3, name: UserRole.MANAGER, permissions: [Permission.READ_USER, Permission.CREATE_USER] },
      gender: Gender.MALE,
      birthDate: '2005-10-12',
      phoneNumber: '+99890987654',
      isActive: true
    },
    {
      userId: 4,
      username: 'operator',
      firstName: 'Super',
      lastName: 'Admin',
      email: 'operator@gmail.com',
      roleId: 4,
      role: { id: 4, name: UserRole.OPERATOR, permissions: [Permission.READ_USER] },
      gender: Gender.MALE,
      birthDate: '2005-10-12',
      phoneNumber: '+99890987654',
      isActive: true
    }
  ];

  constructor(
    private cookieService: CookieService
  ) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const user = this.mockUsers.find(u => 
      u.username === credentials.username && 
      credentials.password === 'Qwerty123@'
    );

    if (user) {
      const response: AuthResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: user
      };
      this.setSession(response);
      return of(response);
    } else {
      throw new Error('Invalid credentials');
    }
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    // Mock registration - create new user
    const newUser: User = {
      userId: this.mockUsers.length + 1,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      roleId: 5,
      role: { id: 5, name: UserRole.USER, permissions: [Permission.READ_USER, Permission.CREATE_BOOKING] },
      gender: userData.gender as Gender,
      birthDate: userData.birthDate,
      phoneNumber: userData.phoneNumber,
      isActive: true
    };

    this.mockUsers.push(newUser);
    
    const response: AuthResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      user: newUser
    };
    
    this.setSession(response);
    return of(response);
  }

  logout(): void {
    this.cookieService.delete('token');
    this.cookieService.delete('user');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return this.cookieService.get('token') || null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role?.name === role;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.role?.permissions?.some(p => p === permission) || false;
  }

  getDashboardRoute(): string {
    const user = this.getCurrentUser();
    if (!user?.role) return '/';

    // Check for last used page for returning users
    const lastUsedPage = this.getLastUsedPage(user.userId);
    if (lastUsedPage && this.isValidDashboardRoute(lastUsedPage, user.role.name as UserRole)) {
      return lastUsedPage;
    }

    // Default routes for each role
    switch (user.role.name) {
      case UserRole.SUPER_ADMIN:
        return '/dashboard1/super-admin/overview';
      case UserRole.ADMIN:
        return '/dashboard1/admin/overview';
      case UserRole.MANAGER:
        return '/dashboard1/manager/overview';
      case UserRole.OPERATOR:
        return '/dashboard1/operator/overview';
      case UserRole.USER:
        return '/dashboard1/user/overview';
      default:
        return '/';
    }
  }

  getLastUsedPage(userId: number): string | null {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem(`lastUsedPage_${userId}`);
    }
    return null;
  }

  setLastUsedPage(userId: number, route: string): void {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem(`lastUsedPage_${userId}`, route);
    }
  }

  private isValidDashboardRoute(route: string, userRole: UserRole): boolean {
    const roleRoutes = {
      [UserRole.SUPER_ADMIN]: '/dashboard1/super-admin',
      [UserRole.ADMIN]: '/dashboard1/admin',
      [UserRole.MANAGER]: '/dashboard1/manager',
      [UserRole.OPERATOR]: '/dashboard1/operator',
      [UserRole.USER]: '/dashboard1/user'
    };

    return route.startsWith(roleRoutes[userRole] || '');
  }

  private setSession(authResult: AuthResponse): void {
    this.cookieService.set('token', authResult.token, { expires: 7 });
    this.cookieService.set('user', JSON.stringify(authResult.user), { expires: 7 });
    this.currentUserSubject.next(authResult.user);
  }

  private loadUserFromStorage(): void {
    const userStr = this.cookieService.get('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from storage:', error);
        this.logout();
      }
    }
  }

  updateProfile(profile: Partial<User>): Observable<User> {
    const user = this.getCurrentUser();
    if (user) {
      const updatedUser = { ...user, ...profile };
      this.currentUserSubject.next(updatedUser);
      this.cookieService.set('user', JSON.stringify(updatedUser));
      return of(updatedUser);
    }
    throw new Error('No user logged in');
  }
}