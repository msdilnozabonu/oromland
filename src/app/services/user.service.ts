import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User, Role, UserRole, Gender, Permission } from '../models/user.model';

export interface UserSearchParams {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private mockUsers: User[] = [
    {
      userId: 1,
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@oromland.com',
      roleId: 1,
      role: { id: 1, name: UserRole.ADMIN, permissions: [Permission.READ_USER, Permission.CREATE_USER, Permission.UPDATE_USER, Permission.DELETE_USER] },
      gender: Gender.MALE,
      birthDate: '1990-01-01',
      phoneNumber: '+998901234567',
      isActive: true
    },
    {
      userId: 2,
      username: 'user',
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@oromland.com',
      roleId: 2,
      role: { id: 2, name: UserRole.USER, permissions: [Permission.READ_USER, Permission.CREATE_BOOKING] },
      gender: Gender.MALE,
      birthDate: '1995-01-01',
      phoneNumber: '+998901234568',
      isActive: true
    }
  ];

  private mockRoles: Role[] = [
    { id: 1, name: UserRole.SUPER_ADMIN, permissions: [Permission.CREATE_ROLE, Permission.UPDATE_ROLE, Permission.DELETE_ROLE, Permission.READ_ROLE] },
    { id: 2, name: UserRole.ADMIN, permissions: [Permission.CREATE_USER, Permission.UPDATE_USER, Permission.DELETE_USER, Permission.READ_USER] },
    { id: 3, name: UserRole.MANAGER, permissions: [Permission.READ_DOCUMENT, Permission.UPDATE_DOCUMENT, Permission.READ_BOOKING] },
    { id: 4, name: UserRole.OPERATOR, permissions: [Permission.READ_DOCUMENT, Permission.UPDATE_DOCUMENT] },
    { id: 5, name: UserRole.USER, permissions: [Permission.READ_USER, Permission.CREATE_BOOKING] }
  ];

  private nextUserId = 3;
  private nextRoleId = 6;

  constructor() {}

  getProfile(): Observable<User> {
    return of(this.mockUsers[0]);
  }

  updateProfile(profile: Partial<User>): Observable<User> {
    this.mockUsers[0] = { ...this.mockUsers[0], ...profile };
    return of(this.mockUsers[0]);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return of(void 0);
  }

  getAllUsers(searchParams?: UserSearchParams): Observable<{ content: User[], totalElements: number }> {
    let users = [...this.mockUsers];
    
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
    
    return of({ content: users, totalElements: users.length });
  }

  getUserById(id: number): Observable<User> {
    const user = this.mockUsers.find(u => u.userId === id);
    if (user) {
      return of(user);
    }
    throw new Error('User not found');
  }

  createUser(user: Partial<User>): Observable<User> {
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
    
    this.mockUsers.push(newUser);
    return of(newUser);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    const index = this.mockUsers.findIndex(u => u.userId === id);
    if (index !== -1) {
      this.mockUsers[index] = { ...this.mockUsers[index], ...user };
      return of(this.mockUsers[index]);
    }
    throw new Error('User not found');
  }

  deleteUser(id: number): Observable<void> {
    const index = this.mockUsers.findIndex(u => u.userId === id);
    if (index !== -1) {
      this.mockUsers.splice(index, 1);
      return of(void 0);
    }
    throw new Error('User not found');
  }

  activateUser(id: number): Observable<User> {
    const index = this.mockUsers.findIndex(u => u.userId === id);
    if (index !== -1) {
      this.mockUsers[index].isActive = true;
      return of(this.mockUsers[index]);
    }
    throw new Error('User not found');
  }

  deactivateUser(id: number): Observable<User> {
    const index = this.mockUsers.findIndex(u => u.userId === id);
    if (index !== -1) {
      this.mockUsers[index].isActive = false;
      return of(this.mockUsers[index]);
    }
    throw new Error('User not found');
  }

  getAllRoles(): Observable<Role[]> {
    return of(this.mockRoles);
  }

  assignRole(userId: number, roleId: number): Observable<User> {
    const userIndex = this.mockUsers.findIndex(u => u.userId === userId);
    const role = this.mockRoles.find(r => r.id === roleId);
    
    if (userIndex !== -1 && role) {
      this.mockUsers[userIndex].role = role;
      this.mockUsers[userIndex].roleId = roleId;
      return of(this.mockUsers[userIndex]);
    }
    throw new Error('User or role not found');
  }

  removeRole(userId: number): Observable<User> {
    const userIndex = this.mockUsers.findIndex(u => u.userId === userId);
    if (userIndex !== -1) {
      this.mockUsers[userIndex].role = { id: 5, name: UserRole.USER, permissions: [Permission.READ_USER, Permission.CREATE_BOOKING] };
      this.mockUsers[userIndex].roleId = 5;
      return of(this.mockUsers[userIndex]);
    }
    throw new Error('User not found');
  }

  createRole(role: Partial<Role>): Observable<Role> {
    const newRole: Role = {
      id: this.nextRoleId++,
      name: role.name || UserRole.USER,
      permissions: role.permissions || [Permission.READ_USER]
    };
    
    this.mockRoles.push(newRole);
    return of(newRole);
  }

  updateRole(id: number, role: Partial<Role>): Observable<Role> {
    const index = this.mockRoles.findIndex(r => r.id === id);
    if (index !== -1) {
      this.mockRoles[index] = { ...this.mockRoles[index], ...role };
      return of(this.mockRoles[index]);
    }
    throw new Error('Role not found');
  }

  deleteRole(id: number): Observable<void> {
    const index = this.mockRoles.findIndex(r => r.id === id);
    if (index !== -1) {
      this.mockRoles.splice(index, 1);
      return of(void 0);
    }
    throw new Error('Role not found');
  }
}