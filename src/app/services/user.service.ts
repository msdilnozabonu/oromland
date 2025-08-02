import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, Role, UserRole, Gender, Permission } from '../models/user.model';
import { MockDataService } from './mock-data.service';
import { HttpErrorHandlerService } from './http-error-handler.service';

export interface UserSearchParams {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}${environment.apiEndpoints.user}`;
  private rolesUrl = `${environment.apiUrl}${environment.apiEndpoints.roles}`;
  private useMockData = false;
  private nextUserId = 3;
  private nextRoleId = 6;

  constructor(
    private http: HttpClient, 
    private mockDataService: MockDataService,
    private errorHandler: HttpErrorHandlerService
  ) {
    this.checkBackendAvailability().subscribe(available => {
      this.useMockData = !available;
      if (this.useMockData) {
        console.warn('Using mock data - backend unavailable');
      }
    });
  }

  private checkBackendAvailability(): Observable<boolean> {
    // Try a simple endpoint to check if backend is available
    return this.http.get(`${environment.apiUrl}/dashboard`, { observe: 'response' }).pipe(
      map(response => response.status === 200),
      catchError((error) => {
        console.warn('Backend availability check failed:', error);
        return of(false);
      })
    );
  }

  // Profile management
  getProfile(): Observable<User> {
    if (this.useMockData) {
      return of(this.mockDataService.users[0]);
    }
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      catchError(() => of(this.mockDataService.users[0]))
    );
  }

  updateProfile(profile: Partial<User>): Observable<User> {
    if (this.useMockData) {
      this.mockDataService.users[0] = { ...this.mockDataService.users[0], ...profile };
      return of(this.mockDataService.users[0]);
    }
    return this.http.put<User>(`${this.apiUrl}/profile`, profile).pipe(
      catchError(error => {
        this.mockDataService.users[0] = { ...this.mockDataService.users[0], ...profile };
        return of(this.mockDataService.users[0]);
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    if (this.useMockData) {
      return of(void 0);
    }
    return this.http.put<void>(`${this.apiUrl}/change-password`, { 
      currentPassword, 
      newPassword 
    }).pipe(
      catchError(error => throwError(() => new Error('Failed to change password')))
    );
  }

  // User management
  getAllUsers(searchParams?: UserSearchParams): Observable<PaginatedResponse<User>> {
    if (this.useMockData) {
      let users = [...this.mockDataService.users];
      
      if (searchParams?.search) {
        const search = searchParams.search.toLowerCase();
        users = users.filter(u => 
          u.username.toLowerCase().includes(search) ||
          u.firstName.toLowerCase().includes(search) ||
          u.lastName.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
        );
      }
      
      if (searchParams?.role) {
        users = users.filter(u => u.role?.name === searchParams.role);
      }
      
      if (searchParams?.isActive !== undefined) {
        users = users.filter(u => u.isActive === searchParams.isActive);
      }
      
      return of({
        content: users,
        totalElements: users.length,
        page: searchParams?.page || 0,
        size: searchParams?.size || users.length
      });
    }

    let params = new HttpParams();
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<User>>(this.apiUrl, { params }).pipe(
      catchError(error => {
        let users = [...this.mockDataService.users];
        if (searchParams?.search) {
          const search = searchParams.search.toLowerCase();
          users = users.filter(u => 
            u.username.toLowerCase().includes(search) ||
            u.firstName.toLowerCase().includes(search) ||
            u.lastName.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search)
          );
        }
        
        return of({
          content: users,
          totalElements: users.length,
          page: searchParams?.page || 0,
          size: searchParams?.size || users.length
        });
      })
    );
  }

  getUserById(id: number): Observable<User> {
    if (this.useMockData) {
      const user = this.mockDataService.users.find((u: User) => u.userId === id);
      if (user) {
        return of(user);
      }
      return throwError(() => new Error('User not found'));
    }
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        const user = this.mockDataService.users.find((u: User) => u.userId === id);
        if (user) {
          return of(user);
        }
        return throwError(() => new Error('User not found'));
      })
    );
  }

  createUser(user: Partial<User>): Observable<User> {
    if (this.useMockData) {
      const newUser: User = {
        userId: this.nextUserId++,
        username: user.username || 'newuser',
        firstName: user.firstName || 'New',
        lastName: user.lastName || 'User',
        email: user.email || 'newuser@test.com',
        roleId: user.roleId || 5,
        role: user.role || { id: 5, name: UserRole.USER, permissions: [Permission.READ_USER, Permission.CREATE_BOOKING] },
        gender: user.gender || Gender.MALE,
        birthDate: user.birthDate || '2000-01-01',
        phoneNumber: user.phoneNumber || '+998901234567',
        isActive: user.isActive !== undefined ? user.isActive : true
      };
      
      this.mockDataService.users.push(newUser);
      return of(newUser);
    }
    return this.http.post<User>(this.apiUrl, user).pipe(
      catchError(error => throwError(() => new Error('Failed to create user')))
    );
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    if (this.useMockData) {
      const index = this.mockDataService.users.findIndex((u: User) => u.userId === id);
      if (index !== -1) {
        this.mockDataService.users[index] = { ...this.mockDataService.users[index], ...user };
        return of(this.mockDataService.users[index]);
      }
      return throwError(() => new Error('User not found'));
    }
    return this.http.put<User>(`${this.apiUrl}/${id}`, user).pipe(
      catchError(error => throwError(() => new Error('Failed to update user')))
    );
  }

  deleteUser(id: number): Observable<void> {
    if (this.useMockData) {
      const index = this.mockDataService.users.findIndex((u: User) => u.userId === id);
      if (index !== -1) {
        this.mockDataService.users.splice(index, 1);
        return of(void 0);
      }
      return throwError(() => new Error('User not found'));
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => throwError(() => new Error('Failed to delete user')))
    );
  }

  activateUser(id: number): Observable<User> {
    if (this.useMockData) {
      const index = this.mockDataService.users.findIndex((u: User) => u.userId === id);
      if (index !== -1) {
        this.mockDataService.users[index].isActive = true;
        return of(this.mockDataService.users[index]);
      }
      return throwError(() => new Error('User not found'));
    }
    return this.http.put<User>(`${this.apiUrl}/${id}/activate`, {}).pipe(
      catchError(error => throwError(() => new Error('Failed to activate user')))
    );
  }

  deactivateUser(id: number): Observable<User> {
    if (this.useMockData) {
      const index = this.mockDataService.users.findIndex((u: User) => u.userId === id);
      if (index !== -1) {
        this.mockDataService.users[index].isActive = false;
        return of(this.mockDataService.users[index]);
      }
      return throwError(() => new Error('User not found'));
    }
    return this.http.put<User>(`${this.apiUrl}/${id}/deactivate`, {}).pipe(
      catchError(error => throwError(() => new Error('Failed to deactivate user')))
    );
  }

  // Role management
  getAllRoles(): Observable<Role[]> {
    if (this.useMockData) {
      return of(this.mockDataService.roles);
    }
    return this.http.get<Role[]>(this.rolesUrl).pipe(
      catchError(() => of(this.mockDataService.roles))
    );
  }

  assignRole(userId: number, roleId: number): Observable<User> {
    if (this.useMockData) {
      const userIndex = this.mockDataService.users.findIndex((u: User) => u.userId === userId);
      const role = this.mockDataService.roles.find((r: Role) => r.id === roleId);
      
      if (userIndex !== -1 && role) {
        this.mockDataService.users[userIndex].role = role;
        this.mockDataService.users[userIndex].roleId = roleId;
        return of(this.mockDataService.users[userIndex]);
      }
      return throwError(() => new Error('User or role not found'));
    }
    return this.http.put<User>(`${this.apiUrl}/${userId}/role`, { roleId }).pipe(
      catchError(error => throwError(() => new Error('Failed to assign role')))
    );
  }

  removeRole(userId: number): Observable<User> {
    if (this.useMockData) {
      const userIndex = this.mockDataService.users.findIndex((u: User) => u.userId === userId);
      if (userIndex !== -1) {
        this.mockDataService.users[userIndex].role = { id: 5, name: UserRole.USER, permissions: [Permission.READ_USER, Permission.CREATE_BOOKING] };
        this.mockDataService.users[userIndex].roleId = 5;
        return of(this.mockDataService.users[userIndex]);
      }
      return throwError(() => new Error('User not found'));
    }
    return this.http.delete<User>(`${this.apiUrl}/${userId}/role`).pipe(
      catchError(error => throwError(() => new Error('Failed to remove role')))
    );
  }

  createRole(role: Partial<Role>): Observable<Role> {
    if (this.useMockData) {
      const newRole: Role = {
        id: this.nextRoleId++,
        name: role.name || UserRole.USER,
        permissions: role.permissions || [Permission.READ_USER]
      };
      
      this.mockDataService.roles.push(newRole);
      return of(newRole);
    }
    return this.http.post<Role>(this.rolesUrl, role).pipe(
      catchError(error => throwError(() => new Error('Failed to create role')))
    );
  }

  updateRole(id: number, role: Partial<Role>): Observable<Role> {
    if (this.useMockData) {
      const index = this.mockDataService.roles.findIndex((r: Role) => r.id === id);
      if (index !== -1) {
        this.mockDataService.roles[index] = { ...this.mockDataService.roles[index], ...role };
        return of(this.mockDataService.roles[index]);
      }
      return throwError(() => new Error('Role not found'));
    }
    return this.http.put<Role>(`${this.rolesUrl}/${id}`, role).pipe(
      catchError(error => throwError(() => new Error('Failed to update role')))
    );
  }

  deleteRole(id: number): Observable<void> {
    if (this.useMockData) {
      const index = this.mockDataService.roles.findIndex((r: Role) => r.id === id);
      if (index !== -1) {
        this.mockDataService.roles.splice(index, 1);
        return of(void 0);
      }
      return throwError(() => new Error('Role not found'));
    }
    return this.http.delete<void>(`${this.rolesUrl}/${id}`).pipe(
      catchError(error => throwError(() => new Error('Failed to delete role')))
    );
  }

  // Permission checking
  hasPermission(user: User, permission: Permission): boolean {
    return user.role?.permissions?.includes(permission) || false;
  }

  hasAnyPermission(user: User, permissions: Permission[]): boolean {
    return permissions.some(p => this.hasPermission(user, p));
  }
}