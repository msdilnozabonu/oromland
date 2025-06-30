import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../services/role.service';
import { AuthService } from '../../services/auth.service';
import { Role, Permission } from '../../models/user.model';

@Component({
  selector: 'app-role-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card mt-3" *ngIf="currentUser">
      <div class="card-header">
        <h6 class="mb-0">
          <i class="fas fa-users-cog me-2"></i>Role & Permission Debug
          <button class="btn btn-sm btn-outline-secondary float-end" (click)="refreshRoles()">
            <i class="fas fa-sync me-1"></i>Refresh
          </button>
        </h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <h6>Current User Role:</h6>
            <div class="mb-3">
              <span class="badge bg-primary">{{ currentUser.role?.name || 'No Role' }}</span>
              <span class="badge bg-secondary ms-2">ID: {{ currentUser.role?.id || 'N/A' }}</span>
            </div>
            
            <h6>User Permissions:</h6>
            <div class="mb-3" *ngIf="currentUser.role?.permissions?.length; else noPermissions">
              <span *ngFor="let permission of currentUser.role.permissions" 
                    class="badge bg-info me-1 mb-1">{{ permission }}</span>
            </div>
            <ng-template #noPermissions>
              <div class="text-muted">No permissions found</div>
            </ng-template>
          </div>
          
          <div class="col-md-6">
            <h6>All Available Roles:</h6>
            <div *ngIf="roles.length > 0; else loadingRoles">
              <div *ngFor="let role of roles" class="card mb-2">
                <div class="card-body p-2">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-bold">{{ role.name }}</span>
                    <span class="badge bg-secondary">{{ role.permissions.length }} perms</span>
                  </div>
                  <small class="text-muted">ID: {{ role.id }}</small>
                </div>
              </div>
            </div>
            <ng-template #loadingRoles>
              <div class="text-muted">
                <i class="fas fa-spinner fa-spin me-2"></i>Loading roles...
              </div>
            </ng-template>
          </div>
        </div>
        
        <div class="mt-4" *ngIf="roles.length > 0">
          <h6>Detailed Role Permissions:</h6>
          <div class="accordion" id="roleAccordion">
            <div *ngFor="let role of roles; let i = index" class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" 
                        [attr.data-bs-toggle]="'collapse'"
                        [attr.data-bs-target]="'#collapse' + i"
                        [attr.aria-expanded]="false"
                        [attr.aria-controls]="'collapse' + i">
                  {{ role.name }} ({{ role.permissions.length }} permissions)
                </button>
              </h2>
              <div [id]="'collapse' + i" class="accordion-collapse collapse" 
                   [attr.data-bs-parent]="'#roleAccordion'">
                <div class="accordion-body">
                  <div class="row">
                    <div class="col-12">
                      <span *ngFor="let permission of role.permissions" 
                            class="badge bg-light text-dark me-1 mb-1 border">{{ permission }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-3">
          <small class="text-muted">
            <i class="fas fa-info-circle me-1"></i>
            This component helps debug role and permission loading from the backend.
            Roles are fetched via HTTP requests to {{ apiUrl }}/roles
          </small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
    }
    
    .card-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }
    
    .badge {
      font-size: 0.75em;
    }
    
    .accordion-button {
      font-size: 0.9rem;
      padding: 0.5rem 1rem;
    }
    
    .accordion-body {
      padding: 1rem;
    }
  `]
})
export class RoleDebugComponent implements OnInit {
  roles: Role[] = [];
  currentUser: any = null;
  apiUrl: string = '';

  constructor(
    private roleService: RoleService,
    private authService: AuthService
  ) {
    this.apiUrl = '/api'; // Replace with actual API URL
  }

  ngOnInit() {
    // Get current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Load roles
    this.loadRoles();
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        console.log('Loaded roles:', roles);
      },
      error: (error) => {
        console.error('Failed to load roles:', error);
      }
    });
  }

  refreshRoles() {
    this.roles = [];
    this.roleService.loadRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        console.log('Refreshed roles:', roles);
      },
      error: (error) => {
        console.error('Failed to refresh roles:', error);
      }
    });
  }
}