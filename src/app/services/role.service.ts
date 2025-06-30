import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Role, Permission } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = environment.apiBaseUrl;
  private rolesSubject = new BehaviorSubject<Role[]>([]);
  public roles$ = this.rolesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadRoles();
  }

  /**
   * Load all roles from backend
   */
  loadRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`).pipe(
      tap(roles => this.rolesSubject.next(roles)),
      catchError(error => {
        console.warn('Failed to load roles from API, using fallback:', error);
        // Fallback to default roles if API fails
        const fallbackRoles = this.getFallbackRoles();
        this.rolesSubject.next(fallbackRoles);
        return of(fallbackRoles);
      })
    );
  }

  /**
   * Get all roles
   */
  getRoles(): Observable<Role[]> {
    return this.roles$;
  }

  /**
   * Get role by ID
   */
  getRoleById(id: number): Observable<Role | undefined> {
    return this.http.get<Role>(`${this.apiUrl}/roles/${id}`).pipe(
      catchError(error => {
        console.warn('Failed to get role by ID, using fallback:', error);
        const fallbackRoles = this.getFallbackRoles();
        const role = fallbackRoles.find(r => r.id === id);
        return of(role);
      })
    );
  }

  /**
   * Create new role
   */
  createRole(role: Omit<Role, 'id'>): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles`, role).pipe(
      tap(() => this.loadRoles()), // Refresh roles after creation
      catchError(error => {
        console.error('Failed to create role:', error);
        throw error;
      })
    );
  }

  /**
   * Update existing role
   */
  updateRole(id: number, role: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/roles/${id}`, role).pipe(
      tap(() => this.loadRoles()), // Refresh roles after update
      catchError(error => {
        console.error('Failed to update role:', error);
        throw error;
      })
    );
  }

  /**
   * Delete role
   */
  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles/${id}`).pipe(
      tap(() => this.loadRoles()), // Refresh roles after deletion
      catchError(error => {
        console.error('Failed to delete role:', error);
        throw error;
      })
    );
  }

  /**
   * Get permissions for a specific role
   */
  getRolePermissions(roleId: number): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/roles/${roleId}/permissions`).pipe(
      catchError(error => {
        console.warn('Failed to get role permissions, using fallback:', error);
        const fallbackRoles = this.getFallbackRoles();
        const role = fallbackRoles.find(r => r.id === roleId);
        return of(role?.permissions || []);
      })
    );
  }

  /**
   * Update permissions for a specific role
   */
  updateRolePermissions(roleId: number, permissions: Permission[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/roles/${roleId}/permissions`, { permissions }).pipe(
      tap(() => this.loadRoles()), // Refresh roles after permission update
      catchError(error => {
        console.error('Failed to update role permissions:', error);
        throw error;
      })
    );
  }

  /**
   * Get all available permissions
   */
  getAllPermissions(): Permission[] {
    return Object.values(Permission);
  }

  /**
   * Check if a role has a specific permission
   */
  hasPermission(role: Role, permission: Permission): boolean {
    return role.permissions.includes(permission);
  }

  /**
   * Fallback roles when API is not available
   */
  private getFallbackRoles(): Role[] {
    return [
      {
        id: 1,
        name: 'SUPER_ADMIN',
        permissions: [
          Permission.CREATE_ROLE,
          Permission.UPDATE_ROLE,
          Permission.DELETE_ROLE,
          Permission.READ_ROLE,
          Permission.CREATE_ADMINISTRATOR,
          Permission.UPDATE_ADMINISTRATOR,
          Permission.DELETE_ADMINISTRATOR,
          Permission.READ_ADMINISTRATOR,
          Permission.CREATE_ADMIN,
          Permission.UPDATE_ADMIN,
          Permission.DELETE_ADMIN,
          Permission.READ_ADMIN,
          Permission.CREATE_MANAGER,
          Permission.UPDATE_MANAGER,
          Permission.DELETE_MANAGER,
          Permission.READ_MANAGER,
          Permission.CREATE_OPERATOR,
          Permission.UPDATE_OPERATOR,
          Permission.DELETE_OPERATOR,
          Permission.READ_OPERATOR,
          Permission.CREATE_USER,
          Permission.UPDATE_USER,
          Permission.DELETE_USER,
          Permission.READ_USER,
          Permission.CREATE_CAMP,
          Permission.UPDATE_CAMP,
          Permission.DELETE_CAMP,
          Permission.READ_CAMP,
          Permission.CREATE_SANATARIUM,
          Permission.UPDATE_SANATARIUM,
          Permission.DELETE_SANATARIUM,
          Permission.READ_SANATARIUM,
          Permission.CREATE_BOOKING,
          Permission.UPDATE_BOOKING,
          Permission.DELETE_BOOKING,
          Permission.READ_BOOKING,
          Permission.CREATE_DOCUMENT,
          Permission.UPDATE_DOCUMENT,
          Permission.DELETE_DOCUMENT,
          Permission.READ_DOCUMENT
        ]
      },
      {
        id: 2,
        name: 'ADMIN',
        permissions: [
          Permission.CREATE_MANAGER,
          Permission.UPDATE_MANAGER,
          Permission.DELETE_MANAGER,
          Permission.READ_MANAGER,
          Permission.CREATE_OPERATOR,
          Permission.UPDATE_OPERATOR,
          Permission.DELETE_OPERATOR,
          Permission.READ_OPERATOR,
          Permission.CREATE_USER,
          Permission.UPDATE_USER,
          Permission.DELETE_USER,
          Permission.READ_USER,
          Permission.CREATE_CAMP,
          Permission.UPDATE_CAMP,
          Permission.DELETE_CAMP,
          Permission.READ_CAMP,
          Permission.CREATE_SANATARIUM,
          Permission.UPDATE_SANATARIUM,
          Permission.DELETE_SANATARIUM,
          Permission.READ_SANATARIUM,
          Permission.CREATE_BOOKING,
          Permission.UPDATE_BOOKING,
          Permission.DELETE_BOOKING,
          Permission.READ_BOOKING,
          Permission.CREATE_DOCUMENT,
          Permission.UPDATE_DOCUMENT,
          Permission.DELETE_DOCUMENT,
          Permission.READ_DOCUMENT
        ]
      },
      {
        id: 3,
        name: 'MANAGER',
        permissions: [
          Permission.CREATE_OPERATOR,
          Permission.UPDATE_OPERATOR,
          Permission.READ_OPERATOR,
          Permission.CREATE_USER,
          Permission.UPDATE_USER,
          Permission.READ_USER,
          Permission.CREATE_CAMP,
          Permission.UPDATE_CAMP,
          Permission.READ_CAMP,
          Permission.CREATE_SANATARIUM,
          Permission.UPDATE_SANATARIUM,
          Permission.READ_SANATARIUM,
          Permission.CREATE_BOOKING,
          Permission.UPDATE_BOOKING,
          Permission.DELETE_BOOKING,
          Permission.READ_BOOKING,
          Permission.CREATE_DOCUMENT,
          Permission.UPDATE_DOCUMENT,
          Permission.READ_DOCUMENT
        ]
      },
      {
        id: 4,
        name: 'OPERATOR',
        permissions: [
          Permission.READ_USER,
          Permission.READ_CAMP,
          Permission.READ_SANATARIUM,
          Permission.CREATE_BOOKING,
          Permission.UPDATE_BOOKING,
          Permission.READ_BOOKING,
          Permission.CREATE_DOCUMENT,
          Permission.READ_DOCUMENT
        ]
      },
      {
        id: 5,
        name: 'USER',
        permissions: [
          Permission.READ_CAMP,
          Permission.READ_SANATARIUM,
          Permission.CREATE_BOOKING,
          Permission.READ_BOOKING,
          Permission.READ_DOCUMENT
        ]
      }
    ];
  }
}