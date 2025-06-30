import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, UserRole, Gender, Permission } from '../models/user.model';
import { TokenService, TokenResponse } from './token.service';
import { RoleService } from './role.service';

export { UserRole };

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
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Test credentials - Remove in production
  private testCredentials = {
    'super_admin': '@Qwerty1234',
    'admin': '@Qwerty1234',
    'manager': '@Qwerty1234',
    'operator': '@Qwerty1234'
  };

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private roleService: RoleService
  ) {
    this.loadUserFromStorage();
  }

  private isAdminRole(username: string): boolean {
    return Object.keys(this.testCredentials).includes(username);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return new Observable<AuthResponse>(observer => {
      // Check if this is a test admin credential first
      if (this.isAdminRole(credentials.username)) {
        // Use test credentials for admin roles
        const expectedPassword = this.testCredentials[credentials.username as keyof typeof this.testCredentials];
        if (credentials.password === expectedPassword) {
          this.createMockAdminResponse(credentials.username).subscribe({
            next: (response) => {
              this.setSession(response);
              observer.next(response);
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
          return;
        } else {
          observer.error(new Error('Invalid credentials'));
          return;
        }
      }

      // For regular users, try API first
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).subscribe({
        next: (response) => {
          this.setSession(response);
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          console.error('API login failed:', err);
          console.error('Error details:', {
            status: err.status,
            statusText: err.statusText,
            url: err.url,
            message: err.message
          });
          
          // Fallback to mock data for development (regular users)
          this.mockLogin(credentials).subscribe({
            next: (mockResponse) => {
              this.setSession(mockResponse);
              observer.next(mockResponse);
              observer.complete();
            },
            error: (mockErr) => observer.error(err)
          });
        }
      });
    });
  }

  private createMockAdminResponse(username: string): Observable<AuthResponse> {
    return new Observable<AuthResponse>(observer => {
      // Get role from backend
      this.roleService.getRoles().subscribe({
        next: (roles) => {
          const userRole = this.getUserRoleByUsername(username);
          const role = roles.find(r => r.name === userRole);
          
          if (role) {
            const user: User = {
              userId: this.getUserIdByUsername(username),
              username: username,
              firstName: this.getFirstNameByUsername(username),
              lastName: this.getLastNameByUsername(username),
              email: `${username}@oromland.uz`,
              roleId: role.id,
              role: role,
              gender: Gender.MALE,
              birthDate: '1990-01-01',
              phoneNumber: '+998901234567',
              isActive: true
            };

            const response: AuthResponse = {
              accessToken: this.generateMockJWT(user),
              refreshToken: 'mock-refresh-token-' + Date.now(),
              expiresIn: 3600, // 1 hour
              tokenType: 'Bearer',
              user: user
            };
            
            observer.next(response);
            observer.complete();
          } else {
            observer.error(new Error('Role not found'));
          }
        },
        error: (err) => observer.error(err)
      });
    });
  }

  private mockLogin(credentials: LoginRequest): Observable<AuthResponse> {
    return new Observable<AuthResponse>(observer => {
      setTimeout(() => {
        // Create mock user for testing
        const user: User = {
          userId: Date.now(),
          username: credentials.username,
          firstName: 'Test',
          lastName: 'User',
          email: credentials.username + '@example.com',
          roleId: 5,
          role: { id: 5, name: 'USER', permissions: [Permission.READ_CAMP, Permission.READ_SANATARIUM] },
          gender: Gender.MALE,
          birthDate: '1990-01-01',
          phoneNumber: '+998901234567',
          isActive: true
        };

        const response: AuthResponse = {
          accessToken: this.generateMockJWT(user),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          expiresIn: 3600, // 1 hour
          tokenType: 'Bearer',
          user: user
        };
        
        observer.next(response);
        observer.complete();
      }, 1000);
    });
  }

  private getUserRoleByUsername(username: string): string {
    const roleMap: { [key: string]: string } = {
      'super_admin': 'SUPER_ADMIN',
      'admin': 'ADMIN',
      'manager': 'MANAGER',
      'operator': 'OPERATOR'
    };
    return roleMap[username] || 'USER';
  }

  private getUserIdByUsername(username: string): number {
    const idMap: { [key: string]: number } = {
      'super_admin': 1,
      'admin': 2,
      'manager': 3,
      'operator': 4
    };
    return idMap[username] || Date.now();
  }

  private getFirstNameByUsername(username: string): string {
    const nameMap: { [key: string]: string } = {
      'super_admin': 'Super',
      'admin': 'Admin',
      'manager': 'Manager',
      'operator': 'Operator'
    };
    return nameMap[username] || 'User';
  }

  private getLastNameByUsername(username: string): string {
    const nameMap: { [key: string]: string } = {
      'super_admin': 'Administrator',
      'admin': 'User',
      'manager': 'User',
      'operator': 'User'
    };
    return nameMap[username] || 'Test';
  }

  private generateMockJWT(user: User): string {
    // This is a mock JWT for testing - in production, JWT is generated by backend
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: user.userId.toString(),
      username: user.username,
      role: user.role?.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    };
    
    return btoa(JSON.stringify(header)) + '.' + 
           btoa(JSON.stringify(payload)) + '.' + 
           'mock-signature';
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return new Observable<AuthResponse>(observer => {
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData).subscribe({
        next: (response) => {
          this.setSession(response);
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          // Fallback to mock registration for development
          this.mockRegister(userData).subscribe({
            next: (mockResponse) => {
              this.setSession(mockResponse);
              observer.next(mockResponse);
              observer.complete();
            },
            error: (mockErr) => observer.error(err)
          });
        }
      });
    });
  }

  getDashboardRoute(): string {
    const user = this.getCurrentUser();
    if (user && user.role) {
      const role = user.role.name.toLowerCase();
      return `/dashboard1/${role}`;
    }
    return '/dashboard1/user';
  }

  redirectToDashboard(): void {
    const dashboardRoute = this.getDashboardRoute();
    // Use window.location for a clean redirect without navigation issues
    window.location.href = dashboardRoute;
  }

  private mockRegister(userData: RegisterRequest): Observable<AuthResponse> {
    return new Observable<AuthResponse>(observer => {
      setTimeout(() => {
        // Create a new user for mock registration
        const newUser: User = {
          userId: Date.now(),
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          roleId: 5, // USER role
          role: { 
            id: 5, 
            name: 'USER', 
            permissions: [Permission.CREATE_BOOKING, Permission.READ_BOOKING] 
          },
          gender: userData.gender as Gender,
          birthDate: userData.birthDate,
          phoneNumber: userData.phoneNumber,
          isActive: true
        };

        const response: AuthResponse = {
          accessToken: this.generateMockJWT(newUser),
          refreshToken: 'mock-refresh-token-new-user-' + Date.now(),
          expiresIn: 3600,
          tokenType: 'Bearer',
          user: newUser
        };
        observer.next(response);
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    // Clear tokens using TokenService
    this.tokenService.clearTokens();
    
    // Clear user data
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
    
    this.currentUserSubject.next(null);
    
    // Call logout API endpoint
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({
      error: (err) => console.warn('Logout API call failed:', err)
    });
  }

  isAuthenticated(): boolean {
    return this.tokenService.isTokenValid() && !!this.getCurrentUser();
  }

  getToken(): string | null {
    return this.tokenService.getAccessToken();
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



  changePassword(passwordData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/change-password`, passwordData).pipe(
      catchError(error => {
        console.warn('API changePassword failed, using mock:', error);
        return of({ success: true });
      })
    );
  }

  updateCurrentUser(userData: any): void {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('currentUser', JSON.stringify(userData));
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
    // Use TokenService to handle JWT tokens
    const tokenResponse: TokenResponse = {
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      expiresIn: authResult.expiresIn,
      tokenType: authResult.tokenType
    };
    
    this.tokenService.setTokens(tokenResponse);
    
    // Store user data separately
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(authResult.user));
    }
    
    this.currentUserSubject.next(authResult.user);
  }

  private loadUserFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      const userStr = localStorage.getItem('currentUser');
      if (userStr && this.tokenService.isTokenValid()) {
        try {
          const user = JSON.parse(userStr);
          this.currentUserSubject.next(user);
        } catch (error) {
          console.error('Error parsing user from storage:', error);
          this.logout();
        }
      } else if (!this.tokenService.isTokenValid() && this.tokenService.hasRefreshToken()) {
        // Try to refresh token if available
        this.tokenService.refreshAccessToken().subscribe({
          next: () => {
            if (userStr) {
              try {
                const user = JSON.parse(userStr);
                this.currentUserSubject.next(user);
              } catch (error) {
                console.error('Error parsing user from storage:', error);
                this.logout();
              }
            }
          },
          error: () => this.logout()
        });
      }
    }
  }

  updateProfile(profile: Partial<User>): Observable<User> {
    const user = this.getCurrentUser();
    if (user) {
      return new Observable<User>(observer => {
        this.http.put<User>(`${this.apiUrl}/users/${user.userId}`, profile).subscribe({
          next: (updatedUser) => {
            this.currentUserSubject.next(updatedUser);
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            }
            observer.next(updatedUser);
            observer.complete();
          },
          error: (err) => observer.error(err)
        });
      });
    }
    throw new Error('No user logged in');
  }
}