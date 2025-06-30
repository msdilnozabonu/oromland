import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../../services/auth.service';

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
  isActive: boolean;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatIconModule,
    MatFormFieldModule,
    MatChipsModule,
    MatCheckboxModule
  ],
  template: `
    <div class="roles-container">
      <div class="header">
        <h1>Role Management</h1>
        <button mat-raised-button color="primary" (click)="openCreateRoleDialog()">
          <mat-icon>add</mat-icon>
          Create Role
        </button>
      </div>

      <div class="roles-grid">
        <mat-card *ngFor="let role of roles" class="role-card">
          <mat-card-header>
            <div mat-card-avatar class="role-avatar" [style.background-color]="getRoleColor(role.name)">
              <mat-icon>{{getRoleIcon(role.name)}}</mat-icon>
            </div>
            <mat-card-title>{{role.name}}</mat-card-title>
            <mat-card-subtitle>{{role.description}}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="role-stats">
              <div class="stat">
                <span class="stat-number">{{role.userCount}}</span>
                <span class="stat-label">Users</span>
              </div>
              <div class="stat">
                <span class="stat-number">{{role.permissions.length}}</span>
                <span class="stat-label">Permissions</span>
              </div>
            </div>

            <div class="permissions-section">
              <h4>Permissions:</h4>
              <div class="permissions-chips">
                <mat-chip-set>
                  <mat-chip *ngFor="let permission of role.permissions" 
                           [style.background-color]="getPermissionColor(permission)">
                    {{permission}}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </div>

            <div class="role-status">
              <span class="status-badge" [class.active]="role.isActive" [class.inactive]="!role.isActive">
                {{role.isActive ? 'Active' : 'Inactive'}}
              </span>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button color="primary" (click)="editRole(role)">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            <button mat-button color="warn" (click)="deleteRole(role)" 
                    [disabled]="role.name === 'SUPER_ADMIN'">
              <mat-icon>delete</mat-icon>
              Delete
            </button>
            <button mat-button (click)="toggleRoleStatus(role)">
              <mat-icon>{{role.isActive ? 'visibility_off' : 'visibility'}}</mat-icon>
              {{role.isActive ? 'Deactivate' : 'Activate'}}
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Create/Edit Role Dialog -->
      <div *ngIf="showRoleDialog" class="role-dialog-overlay" (click)="closeRoleDialog()">
        <div class="role-dialog" (click)="$event.stopPropagation()">
          <h2>{{isEditMode ? 'Edit Role' : 'Create New Role'}}</h2>
          <form [formGroup]="roleForm" (ngSubmit)="saveRole()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Role Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter role name">
              <mat-error *ngIf="roleForm.get('name')?.hasError('required')">
                Role name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" 
                        placeholder="Enter role description"></textarea>
              <mat-error *ngIf="roleForm.get('description')?.hasError('required')">
                Description is required
              </mat-error>
            </mat-form-field>

            <div class="permissions-section">
              <h4>Permissions</h4>
              <div class="permissions-grid">
                <mat-checkbox *ngFor="let permission of availablePermissions" 
                             [checked]="isPermissionSelected(permission)"
                             (change)="togglePermission(permission, $event.source.checked)">
                  {{permission}}
                </mat-checkbox>
              </div>
            </div>

            <div class="dialog-actions">
              <button type="button" mat-button (click)="closeRoleDialog()">Cancel</button>
              <button type="submit" mat-raised-button color="primary" 
                      [disabled]="!roleForm.valid || isSaving">
                {{isSaving ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .roles-container {
      padding: 2rem;
      background: #ffffff;
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      color: #2d3748;
      font-size: 2rem;
      font-weight: 600;
      margin: 0;
    }

    .roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
    }

    .role-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .role-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .role-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .role-stats {
      display: flex;
      gap: 2rem;
      margin: 1rem 0;
    }

    .stat {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 600;
      color: #4CAF50;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #6b7280;
    }

    .permissions-section h4 {
      margin: 1rem 0 0.5rem 0;
      color: #2d3748;
    }

    .permissions-chips {
      margin-bottom: 1rem;
    }

    .permissions-chips mat-chip {
      margin: 0.2rem;
      color: white;
    }

    .role-status {
      margin-top: 1rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .status-badge.active {
      background: #4CAF50;
      color: white;
    }

    .status-badge.inactive {
      background: #f3f4f6;
      color: #6b7280;
    }

    /* Dialog Styles */
    .role-dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .role-dialog {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .role-dialog h2 {
      margin-top: 0;
      color: #2d3748;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .permissions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    @media (max-width: 768px) {
      .roles-container {
        padding: 1rem;
      }

      .header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .roles-grid {
        grid-template-columns: 1fr;
      }

      .role-stats {
        justify-content: center;
      }
    }
  `]
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  roleForm: FormGroup;
  showRoleDialog = false;
  isEditMode = false;
  isSaving = false;
  currentRole: Role | null = null;
  selectedPermissions: string[] = [];

  availablePermissions = [
    'CREATE_BOOKING',
    'EDIT_BOOKING',
    'DELETE_BOOKING',
    'VIEW_ALL_BOOKINGS',
    'MANAGE_USERS',
    'MANAGE_ROLES',
    'VIEW_REPORTS',
    'MANAGE_CAMPS',
    'MANAGE_SANATORIUMS',
    'APPROVE_BOOKINGS',
    'REJECT_BOOKINGS',
    'UPLOAD_DOCUMENTS',
    'MANAGE_REVIEWS',
    'SYSTEM_SETTINGS'
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    // Mock data for now - replace with actual API call
    this.roles = [
      {
        id: 1,
        name: 'SUPER_ADMIN',
        description: 'Full system access with all permissions',
        permissions: [...this.availablePermissions],
        userCount: 2,
        createdAt: '2024-01-01',
        isActive: true
      },
      {
        id: 2,
        name: 'ADMIN',
        description: 'Administrative access to manage bookings and users',
        permissions: ['CREATE_BOOKING', 'EDIT_BOOKING', 'VIEW_ALL_BOOKINGS', 'MANAGE_USERS', 'APPROVE_BOOKINGS', 'REJECT_BOOKINGS'],
        userCount: 5,
        createdAt: '2024-01-02',
        isActive: true
      },
      {
        id: 3,
        name: 'USER',
        description: 'Standard user access for creating and managing own bookings',
        permissions: ['CREATE_BOOKING', 'EDIT_BOOKING', 'UPLOAD_DOCUMENTS'],
        userCount: 150,
        createdAt: '2024-01-03',
        isActive: true
      }
    ];
  }

  getRoleColor(roleName: string): string {
    const colors: { [key: string]: string } = {
      'SUPER_ADMIN': '#e91e63',
      'ADMIN': '#4CAF50',
      'USER': '#2196F3'
    };
    return colors[roleName] || '#6b7280';
  }

  getRoleIcon(roleName: string): string {
    const icons: { [key: string]: string } = {
      'SUPER_ADMIN': 'shield',
      'ADMIN': 'admin_panel_settings',
      'USER': 'person'
    };
    return icons[roleName] || 'group';
  }

  getPermissionColor(permission: string): string {
    if (permission.includes('CREATE')) return '#4CAF50';
    if (permission.includes('DELETE')) return '#f44336';
    if (permission.includes('MANAGE')) return '#ff9800';
    if (permission.includes('VIEW')) return '#2196F3';
    return '#6b7280';
  }

  openCreateRoleDialog(): void {
    this.isEditMode = false;
    this.currentRole = null;
    this.selectedPermissions = [];
    this.roleForm.reset();
    this.showRoleDialog = true;
  }

  editRole(role: Role): void {
    this.isEditMode = true;
    this.currentRole = role;
    this.selectedPermissions = [...role.permissions];
    this.roleForm.patchValue({
      name: role.name,
      description: role.description
    });
    this.showRoleDialog = true;
  }

  closeRoleDialog(): void {
    this.showRoleDialog = false;
    this.roleForm.reset();
    this.selectedPermissions = [];
  }

  isPermissionSelected(permission: string): boolean {
    return this.selectedPermissions.includes(permission);
  }

  togglePermission(permission: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedPermissions.includes(permission)) {
        this.selectedPermissions.push(permission);
      }
    } else {
      this.selectedPermissions = this.selectedPermissions.filter(p => p !== permission);
    }
  }

  saveRole(): void {
    if (this.roleForm.valid && this.selectedPermissions.length > 0) {
      this.isSaving = true;
      
      const roleData = {
        ...this.roleForm.value,
        permissions: this.selectedPermissions
      };

      // Mock save - replace with actual API call
      setTimeout(() => {
        if (this.isEditMode && this.currentRole) {
          // Update existing role
          const index = this.roles.findIndex(r => r.id === this.currentRole!.id);
          if (index !== -1) {
            this.roles[index] = {
              ...this.roles[index],
              ...roleData
            };
          }
          this.showSnackBar('Role updated successfully!', 'success');
        } else {
          // Create new role
          const newRole: Role = {
            id: Math.max(...this.roles.map(r => r.id)) + 1,
            ...roleData,
            userCount: 0,
            createdAt: new Date().toISOString(),
            isActive: true
          };
          this.roles.push(newRole);
          this.showSnackBar('Role created successfully!', 'success');
        }
        
        this.isSaving = false;
        this.closeRoleDialog();
      }, 1000);
    } else {
      this.showSnackBar('Please fill all required fields and select at least one permission', 'error');
    }
  }

  deleteRole(role: Role): void {
    if (role.name === 'SUPER_ADMIN') {
      this.showSnackBar('Cannot delete SUPER_ADMIN role', 'error');
      return;
    }

    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      // Mock delete - replace with actual API call
      this.roles = this.roles.filter(r => r.id !== role.id);
      this.showSnackBar('Role deleted successfully!', 'success');
    }
  }

  toggleRoleStatus(role: Role): void {
    if (role.name === 'SUPER_ADMIN') {
      this.showSnackBar('Cannot modify SUPER_ADMIN role status', 'error');
      return;
    }

    // Mock toggle - replace with actual API call
    role.isActive = !role.isActive;
    this.showSnackBar(`Role ${role.isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [`snackbar-${type}`]
    });
  }
}