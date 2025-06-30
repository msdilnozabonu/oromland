import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';

import { UserService } from '../../../services/user.service';
import { Role, Permission, UserRole } from '../../../models/user.model';

interface RoleWithPermissions extends Role {
  permissionsList: Permission[];
}

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTableModule,
    MatCheckboxModule,
    MatExpansionModule
  ],
  template: `
    <div class="role-management-container">
      <div class="header">
        <h1><i class="fas fa-user-shield"></i> Role Management</h1>
        <button mat-raised-button color="primary" (click)="openCreateRoleDialog()" class="create-btn">
          <i class="fas fa-plus"></i>
          Create New Role
        </button>
      </div>

      <!-- Roles Overview -->
      <div class="roles-section">
        <div class="section-header">
          <h2>Existing Roles</h2>
          <p>Manage system roles and permissions</p>
        </div>

        <div class="roles-grid">
          <div *ngFor="let role of roles" class="role-card">
            <div class="role-header">
              <div class="role-icon">
                <i class="{{getRoleIcon(role.name)}}"></i>
              </div>
              <div class="role-info">
                <h3>{{role.name}}</h3>
                <p>{{getRoleDescription(role.name)}}</p>
              </div>
              <div class="role-actions">
                <button mat-icon-button (click)="editRole(role)" 
                        [disabled]="!canEditRole(role.name)"
                        matTooltip="Edit Role">
                  <i class="fas fa-edit"></i>
                </button>
                <button mat-icon-button (click)="deleteRole(role)" 
                        [disabled]="!canDeleteRole(role.name)"
                        matTooltip="Delete Role"
                        class="delete-btn">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <div class="role-content">
              <div class="permissions-section">
                <h4><i class="fas fa-key"></i> Permissions ({{role.permissions.length}})</h4>
                <div class="permissions-list">
                  <span *ngFor="let permission of role.permissions.slice(0, 5)" 
                        class="permission-tag">
                    {{formatPermissionName(permission)}}
                  </span>
                  <span *ngIf="role.permissions.length > 5" class="more-permissions">
                    +{{role.permissions.length - 5}} more
                  </span>
                </div>
              </div>

              <div class="role-stats">
                <div class="stat">
                  <span class="stat-number">{{getUserCountForRole(role.name)}}</span>
                  <span class="stat-label">Users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Role Form -->
      <div class="role-form-section" *ngIf="showRoleForm">
        <mat-card class="role-form-card">
          <mat-card-header>
            <mat-card-title>
              <i class="fas fa-user-plus"></i>
              {{editingRole ? 'Edit Role' : 'Create New Role'}}
            </mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="roleForm" class="role-form">
              <div class="form-section">
                <h3>Role Information</h3>
                
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Role Name</mat-label>
                    <input matInput formControlName="name" placeholder="Enter role name">
                    <mat-error *ngIf="roleForm.get('name')?.hasError('required')">
                      Role name is required
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>

              <div class="form-section">
                <h3>Permissions</h3>
                <p class="section-description">Select the permissions for this role</p>
                
                <mat-accordion class="permissions-accordion">
                  <mat-expansion-panel *ngFor="let category of permissionCategories">
                    <mat-expansion-panel-header>
                      <mat-panel-title>
                        <i class="{{category.icon}}"></i>
                        {{category.name}}
                      </mat-panel-title>
                      <mat-panel-description>
                        {{getSelectedPermissionsCount(category.permissions)}} of {{category.permissions.length}} selected
                      </mat-panel-description>
                    </mat-expansion-panel-header>

                    <div class="permission-group">
                      <div *ngFor="let permission of category.permissions" class="permission-item">
                        <mat-checkbox 
                          [checked]="isPermissionSelected(permission)"
                          (change)="togglePermission(permission, $event.checked)">
                          {{formatPermissionName(permission)}}
                        </mat-checkbox>
                        <span class="permission-description">
                          {{getPermissionDescription(permission)}}
                        </span>
                      </div>
                    </div>
                  </mat-expansion-panel>
                </mat-accordion>
              </div>
            </form>
          </mat-card-content>

          <mat-card-actions class="form-actions">
            <button mat-button (click)="cancelRoleForm()" class="cancel-btn">
              Cancel
            </button>
            <button mat-raised-button color="primary" 
                    (click)="saveRole()" 
                    [disabled]="!roleForm.valid || isSaving"
                    class="save-btn">
              <i class="fas fa-save" *ngIf="!isSaving"></i>
              <i class="fas fa-spinner fa-spin" *ngIf="isSaving"></i>
              {{isSaving ? 'Saving...' : (editingRole ? 'Update Role' : 'Create Role')}}
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./role-management.component.scss']
})
export class RoleManagementComponent implements OnInit {
  roles: RoleWithPermissions[] = [];
  roleForm: FormGroup;
  showRoleForm = false;
  editingRole: RoleWithPermissions | null = null;
  isSaving = false;

  permissionCategories = [
    {
      name: 'User Management',
      icon: 'fas fa-users',
      permissions: [Permission.CREATE_USER, Permission.READ_USER, Permission.UPDATE_USER, Permission.DELETE_USER]
    },
    {
      name: 'Role Management',
      icon: 'fas fa-user-shield',
      permissions: [Permission.CREATE_ROLE, Permission.READ_ROLE, Permission.UPDATE_ROLE, Permission.DELETE_ROLE]
    },
    {
      name: 'Camp Management',
      icon: 'fas fa-campground',
      permissions: [Permission.CREATE_CAMP, Permission.READ_CAMP, Permission.UPDATE_CAMP, Permission.DELETE_CAMP]
    },
    {
      name: 'Sanatorium Management',
      icon: 'fas fa-hospital',
      permissions: [Permission.CREATE_SANATARIUM, Permission.READ_SANATARIUM, Permission.UPDATE_SANATARIUM, Permission.DELETE_SANATARIUM]
    },
    {
      name: 'Booking Management',
      icon: 'fas fa-calendar-check',
      permissions: [Permission.CREATE_BOOKING, Permission.READ_BOOKING, Permission.UPDATE_BOOKING, Permission.DELETE_BOOKING]
    },
    {
      name: 'Document Management',
      icon: 'fas fa-file-alt',
      permissions: [Permission.CREATE_DOCUMENT, Permission.READ_DOCUMENT, Permission.UPDATE_DOCUMENT, Permission.DELETE_DOCUMENT]
    }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      permissions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  private loadRoles(): void {
    // Mock data - replace with actual service call
    this.roles = [
      {
        id: 1,
        name: UserRole.SUPER_ADMIN,
        permissions: Object.values(Permission),
        permissionsList: Object.values(Permission)
      },
      {
        id: 2,
        name: UserRole.ADMIN,
        permissions: [
          Permission.READ_USER, Permission.UPDATE_USER,
          Permission.READ_BOOKING, Permission.UPDATE_BOOKING,
          Permission.READ_CAMP, Permission.READ_SANATARIUM
        ],
        permissionsList: [
          Permission.READ_USER, Permission.UPDATE_USER,
          Permission.READ_BOOKING, Permission.UPDATE_BOOKING,
          Permission.READ_CAMP, Permission.READ_SANATARIUM
        ]
      },
      {
        id: 3,
        name: UserRole.MANAGER,
        permissions: [
          Permission.READ_USER, Permission.READ_BOOKING,
          Permission.UPDATE_BOOKING, Permission.READ_DOCUMENT
        ],
        permissionsList: [
          Permission.READ_USER, Permission.READ_BOOKING,
          Permission.UPDATE_BOOKING, Permission.READ_DOCUMENT
        ]
      },
      {
        id: 4,
        name: UserRole.OPERATOR,
        permissions: [Permission.READ_BOOKING, Permission.READ_DOCUMENT],
        permissionsList: [Permission.READ_BOOKING, Permission.READ_DOCUMENT]
      },
      {
        id: 5,
        name: UserRole.USER,
        permissions: [Permission.CREATE_BOOKING, Permission.READ_BOOKING],
        permissionsList: [Permission.CREATE_BOOKING, Permission.READ_BOOKING]
      }
    ];
  }

  getRoleIcon(roleName: string): string {
    const icons: { [key: string]: string } = {
      [UserRole.SUPER_ADMIN]: 'fas fa-crown',
      [UserRole.ADMIN]: 'fas fa-user-shield',
      [UserRole.MANAGER]: 'fas fa-user-tie',
      [UserRole.OPERATOR]: 'fas fa-user-cog',
      [UserRole.USER]: 'fas fa-user'
    };
    return icons[roleName] || 'fas fa-user';
  }

  getRoleDescription(roleName: string): string {
    const descriptions: { [key: string]: string } = {
      [UserRole.SUPER_ADMIN]: 'Full system access and control',
      [UserRole.ADMIN]: 'System administration and user management',
      [UserRole.MANAGER]: 'Booking and document management',
      [UserRole.OPERATOR]: 'Limited booking and document access',
      [UserRole.USER]: 'Basic user access for bookings'
    };
    return descriptions[roleName] || 'Custom role';
  }

  canEditRole(roleName: string): boolean {
    // Super admin can edit all except SUPER_ADMIN role
    return roleName !== UserRole.SUPER_ADMIN;
  }

  canDeleteRole(roleName: string): boolean {
    // Can't delete system roles
    const systemRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.USER];
    return !systemRoles.includes(roleName as UserRole);
  }

  getUserCountForRole(roleName: string): number {
    // Mock data - replace with actual service call
    const counts: { [key: string]: number } = {
      [UserRole.SUPER_ADMIN]: 1,
      [UserRole.ADMIN]: 3,
      [UserRole.MANAGER]: 8,
      [UserRole.OPERATOR]: 15,
      [UserRole.USER]: 247
    };
    return counts[roleName] || 0;
  }

  formatPermissionName(permission: Permission): string {
    return permission.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getPermissionDescription(permission: Permission): string {
    const descriptions: { [key: string]: string } = {
      [Permission.CREATE_USER]: 'Create new users in the system',
      [Permission.READ_USER]: 'View user information',
      [Permission.UPDATE_USER]: 'Edit user details',
      [Permission.DELETE_USER]: 'Remove users from the system',
      [Permission.CREATE_ROLE]: 'Create new roles',
      [Permission.READ_ROLE]: 'View role information',
      [Permission.UPDATE_ROLE]: 'Edit role permissions',
      [Permission.DELETE_ROLE]: 'Remove roles from the system',
      [Permission.CREATE_BOOKING]: 'Create new bookings',
      [Permission.READ_BOOKING]: 'View booking information',
      [Permission.UPDATE_BOOKING]: 'Edit booking details',
      [Permission.DELETE_BOOKING]: 'Cancel or remove bookings'
    };
    return descriptions[permission] || 'Permission description';
  }

  getSelectedPermissionsCount(permissions: Permission[]): number {
    if (!this.editingRole) return 0;
    return permissions.filter(p => this.editingRole!.permissionsList.includes(p)).length;
  }

  isPermissionSelected(permission: Permission): boolean {
    if (!this.editingRole) return false;
    return this.editingRole.permissionsList.includes(permission);
  }

  togglePermission(permission: Permission, checked: boolean): void {
    if (!this.editingRole) return;
    
    if (checked) {
      this.editingRole.permissionsList.push(permission);
    } else {
      const index = this.editingRole.permissionsList.indexOf(permission);
      if (index > -1) {
        this.editingRole.permissionsList.splice(index, 1);
      }
    }
  }

  openCreateRoleDialog(): void {
    this.editingRole = {
      id: 0,
      name: '',
      permissions: [],
      permissionsList: []
    };
    this.roleForm.reset();
    this.showRoleForm = true;
  }

  editRole(role: RoleWithPermissions): void {
    this.editingRole = { ...role, permissionsList: [...role.permissions] };
    this.roleForm.patchValue({
      name: role.name
    });
    this.showRoleForm = true;
  }

  deleteRole(role: RoleWithPermissions): void {
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      // Implement delete logic
      this.showSnackBar(`Role "${role.name}" deleted successfully`, 'success');
      this.loadRoles();
    }
  }

  saveRole(): void {
    if (!this.roleForm.valid || !this.editingRole) return;

    this.isSaving = true;

    const roleData = {
      ...this.roleForm.value,
      permissions: this.editingRole.permissionsList
    };

    // Mock save - replace with actual service call
    setTimeout(() => {
      const action = this.editingRole!.id === 0 ? 'created' : 'updated';
      this.showSnackBar(`Role ${action} successfully`, 'success');
      this.cancelRoleForm();
      this.loadRoles();
      this.isSaving = false;
    }, 1500);
  }

  cancelRoleForm(): void {
    this.showRoleForm = false;
    this.editingRole = null;
    this.roleForm.reset();
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: [`snackbar-${type}`]
    });
  }
}