import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CreativeStatsComponent } from '../../../shared/components/creative-stats/creative-stats.component';
import { ActionButtonsComponent } from '../../../shared/components/action-buttons/action-buttons.component';
import { ImageCardComponent, ImageCardData } from '../../../shared/components/image-card/image-card.component';
import { ImageService } from '../../../shared/services/image.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule, 
    MatBadgeModule, 
    MatDialogModule,
    CreativeStatsComponent,
    ActionButtonsComponent,
    ImageCardComponent
  ],
  template: `
    <div class="overview-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h1 class="page-title">
              <mat-icon class="title-icon">admin_panel_settings</mat-icon>
              Admin Dashboard
            </h1>
            <p class="page-subtitle">Complete system management and control</p>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="openQuickActions()" class="quick-action-btn">
              <mat-icon>add</mat-icon>
              Quick Actions
            </button>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card camps">
          <div class="stat-background">
            <mat-icon>nature_people</mat-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{managedCamps}}</div>
            <div class="stat-label">Active Camps</div>
            <div class="stat-change positive">
              <mat-icon>trending_up</mat-icon>
              +12% this month
            </div>
          </div>
          <div class="stat-actions">
            <button mat-icon-button (click)="manageCamps()">
              <mat-icon>settings</mat-icon>
            </button>
          </div>
        </div>

        <div class="stat-card sanatoriums">
          <div class="stat-background">
            <mat-icon>local_hospital</mat-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{managedSanatoriums}}</div>
            <div class="stat-label">Health Centers</div>
            <div class="stat-change positive">
              <mat-icon>trending_up</mat-icon>
              +8% this month
            </div>
          </div>
          <div class="stat-actions">
            <button mat-icon-button (click)="manageSanatoriums()">
              <mat-icon>settings</mat-icon>
            </button>
          </div>
        </div>

        <div class="stat-card users">
          <div class="stat-background">
            <mat-icon>people</mat-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{activeUsers}}</div>
            <div class="stat-label">Active Users</div>
            <div class="stat-change positive">
              <mat-icon>trending_up</mat-icon>
              +156 this week
            </div>
          </div>
          <div class="stat-actions">
            <button mat-icon-button (click)="manageUsers()">
              <mat-icon>person_add</mat-icon>
            </button>
          </div>
        </div>

        <div class="stat-card approvals">
          <div class="stat-background">
            <mat-icon>pending_actions</mat-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{pendingApprovals}}</div>
            <div class="stat-label">Pending Approvals</div>
            <div class="stat-change urgent">
              <mat-icon>priority_high</mat-icon>
              Needs attention
            </div>
          </div>
          <div class="stat-actions">
            <button mat-icon-button (click)="viewApprovals()">
              <mat-icon>visibility</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <app-creative-stats 
        [type]="'admin'"
        class="creative-stats-section">
      </app-creative-stats>

      <div class="management-section">
        <h2 class="section-title">
          <mat-icon>dashboard</mat-icon>
          Management Center
        </h2>
        
        <div class="management-grid">
          <mat-card class="management-card" (click)="addNewCamp()">
            <mat-card-content>
              <div class="management-icon camps">
                <mat-icon>add_location</mat-icon>
              </div>
              <h3>Add New Camp</h3>
              <p>Create and configure a new camping facility</p>
              <div class="card-actions">
                <button mat-raised-button color="primary">
                  <mat-icon>add</mat-icon>
                  Create Camp
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="management-card" (click)="addNewSanatorium()">
            <mat-card-content>
              <div class="management-icon sanatoriums">
                <mat-icon>local_hospital</mat-icon>
              </div>
              <h3>Add Sanatorium</h3>
              <p>Register a new health and wellness center</p>
              <div class="card-actions">
                <button mat-raised-button color="accent">
                  <mat-icon>add</mat-icon>
                  Create Center
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="management-card" (click)="manageRoles()">
            <mat-card-content>
              <div class="management-icon roles">
                <mat-icon>admin_panel_settings</mat-icon>
              </div>
              <h3>User Roles</h3>
              <p>Assign and manage user permissions</p>
              <div class="card-actions">
                <button mat-raised-button color="warn">
                  <mat-icon>security</mat-icon>
                  Manage Roles
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="management-card" (click)="viewReports()">
            <mat-card-content>
              <div class="management-icon reports">
                <mat-icon>analytics</mat-icon>
              </div>
              <h3>Analytics</h3>
              <p>View detailed reports and insights</p>
              <div class="card-actions">
                <button mat-raised-button>
                  <mat-icon>bar_chart</mat-icon>
                  View Reports
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <div class="facilities-showcase">
        <h2 class="section-title">
          <mat-icon>photo_library</mat-icon>
          Featured Facilities
        </h2>
        <div class="facilities-grid">
          <app-image-card 
            *ngFor="let facility of featuredFacilities; trackBy: trackByFacility"
            [data]="facility"
            (cardClick)="handleFacilityClick($event)"
            (actionClick)="handleFacilityAction($event)">
          </app-image-card>
        </div>
      </div>

      <app-action-buttons 
        [type]="'admin'"
        [showQuickActions]="true"
        (actionClick)="handleActionClick($event)"
        class="admin-actions-section">
      </app-action-buttons>
    </div>
  `,
  styles: [`
    .overview-container {
      padding: 2rem;
      background: #f8fffe;
      min-height: 100vh;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .title-icon {
        color: #4CAF50;
      }
    }

    .page-subtitle {
      font-size: 1.1rem;
      color: #6b7280;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .quick-action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      border-radius: 20px;
      padding: 2rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
      border: 1px solid #f0f0f0;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
      }

      &.camps {
        border-left: 4px solid #4CAF50;
        
        .stat-background {
          color: rgba(76, 175, 80, 0.1);
        }
      }

      &.sanatoriums {
        border-left: 4px solid #2196F3;
        
        .stat-background {
          color: rgba(33, 150, 243, 0.1);
        }
      }

      &.users {
        border-left: 4px solid #FF9800;
        
        .stat-background {
          color: rgba(255, 152, 0, 0.1);
        }
      }

      &.approvals {
        border-left: 4px solid #F44336;
        
        .stat-background {
          color: rgba(244, 67, 54, 0.1);
        }
      }
    }

    .stat-background {
      position: absolute;
      top: -20px;
      right: -20px;
      font-size: 4rem;
      opacity: 0.1;
      z-index: 1;
    }

    .stat-content {
      position: relative;
      z-index: 2;
      flex: 1;
    }

    .stat-actions {
      position: relative;
      z-index: 2;
    }

    .stat-icon {
      background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
      color: white;
      width: 60px;
      height: 60px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 1.5rem;
      }
    }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .stat-change {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
      font-weight: 500;

      &.positive {
        color: #4CAF50;
      }

      &.urgent {
        color: #F44336;
        animation: pulse 2s infinite;
      }

      mat-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      mat-icon {
        color: #4CAF50;
      }
    }

    .management-section {
      margin-bottom: 3rem;
    }

    .management-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .management-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 16px;
      overflow: hidden;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
      }

      mat-card-content {
        padding: 2rem;
        text-align: center;
      }

      h3 {
        margin: 1rem 0 0.5rem 0;
        color: #2d3748;
        font-weight: 600;
      }

      p {
        color: #6b7280;
        margin-bottom: 1.5rem;
      }
    }

    .management-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;

      &.camps {
        background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
        color: white;
      }

      &.sanatoriums {
        background: linear-gradient(135deg, #2196F3 0%, #64B5F6 100%);
        color: white;
      }

      &.roles {
        background: linear-gradient(135deg, #F44336 0%, #EF5350 100%);
        color: white;
      }

      &.reports {
        background: linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%);
        color: white;
      }

      mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
      }
    }

    .card-actions {
      margin-top: 1rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid #e8f5e8;
      box-shadow: 0 4px 15px rgba(76, 175, 80, 0.08);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(76, 175, 80, 0.15);
        border-color: #4CAF50;

        .action-icon {
          background: #4CAF50;
          transform: scale(1.1);
        }
      }
    }

    .action-icon {
      background: #f0fdf4;
      color: #4CAF50;
      width: 60px;
      height: 60px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;

      i {
        font-size: 1.5rem;
      }
    }

    .action-content {
      flex: 1;

      h4 {
        font-size: 1.1rem;
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 0.25rem;
      }

      p {
        font-size: 0.9rem;
        color: #6b7280;
        margin: 0;
      }
    }

    @media (max-width: 768px) {
      .overview-container {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .facilities-grid {
        grid-template-columns: 1fr;
      }
    }

    .facilities-showcase {
      margin: 3rem 0;
    }

    .facilities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }

    .admin-actions-section {
      margin-top: 3rem;
    }
  `]
})
export class OverviewComponent implements OnInit {
  managedCamps = 12;
  managedSanatoriums = 8;
  activeUsers = 456;
  pendingApprovals = 15;
  featuredFacilities: ImageCardData[] = [];

  constructor(
    private dialog: MatDialog,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
    this.loadFeaturedFacilities();
    this.imageService.preloadImages();
  }

  private loadFeaturedFacilities(): void {
    this.featuredFacilities = [
      {
        id: 'sanatorium-1',
        title: 'Luxury Health Resort',
        subtitle: 'Premium Medical Care',
        description: 'State-of-the-art medical facilities with luxury accommodations and spa treatments.',
        imageUrl: this.imageService.getDefaultImage('sanatoriums'),
        type: 'sanatoriums',
        rating: 4.8,
        price: 150,
        location: 'Tashkent, Uzbekistan',
        features: ['Medical', 'Spa', 'WiFi', 'Restaurant'],
        status: 'active',
        badge: {
          text: 'Featured',
          color: '#4CAF50'
        },
        actions: {
          primary: { label: 'Manage', action: 'edit' },
          secondary: { label: 'View Details', action: 'view' }
        }
      },
      {
        id: 'camp-1',
        title: 'Adventure Kids Camp',
        subtitle: 'Summer Activities',
        description: 'Exciting outdoor activities and educational programs for children of all ages.',
        imageUrl: this.imageService.getDefaultImage('camps'),
        type: 'camps',
        rating: 4.6,
        price: 80,
        location: 'Chimgan Mountains',
        features: ['Activities', 'Nature', 'Kids Club', 'Transport'],
        status: 'active',
        badge: {
          text: 'Popular',
          color: '#FF9800'
        },
        actions: {
          primary: { label: 'Manage', action: 'edit' },
          secondary: { label: 'View Details', action: 'view' }
        }
      },
      {
        id: 'sanatorium-2',
        title: 'Wellness Center Oromgoh',
        subtitle: 'Therapeutic Treatments',
        description: 'Specialized in rehabilitation and wellness programs with modern equipment.',
        imageUrl: this.imageService.getDefaultImage('sanatoriums'),
        type: 'sanatoriums',
        rating: 4.7,
        price: 120,
        location: 'Samarkand Region',
        features: ['Medical', 'Pool', 'Gym', 'Parking'],
        status: 'pending',
        badge: {
          text: 'New',
          color: '#2196F3'
        },
        actions: {
          primary: { label: 'Approve', action: 'edit' },
          secondary: { label: 'Review', action: 'view' }
        }
      },
      {
        id: 'camp-2',
        title: 'Family Recreation Camp',
        subtitle: 'All Ages Welcome',
        description: 'Perfect destination for family vacations with activities for all age groups.',
        imageUrl: this.imageService.getDefaultImage('camps'),
        type: 'camps',
        rating: 4.5,
        price: 100,
        location: 'Fergana Valley',
        features: ['Beach', 'Restaurant', 'WiFi', 'Activities'],
        status: 'active',
        actions: {
          primary: { label: 'Manage', action: 'edit' },
          secondary: { label: 'View Details', action: 'view' }
        }
      }
    ];
  }

  private loadStatistics(): void {
    // Load admin statistics from backend
  }

  openQuickActions(): void {
    console.log('Opening quick actions menu');
  }

  manageCamps(): void {
    console.log('Navigate to camps management');
  }

  manageSanatoriums(): void {
    console.log('Navigate to sanatoriums management');
  }

  manageUsers(): void {
    console.log('Navigate to user management');
  }

  viewApprovals(): void {
    console.log('Navigate to pending approvals');
  }

  addNewCamp(): void {
    console.log('Open add new camp dialog');
  }

  addNewSanatorium(): void {
    console.log('Open add new sanatorium dialog');
  }

  manageRoles(): void {
    console.log('Navigate to role management');
  }

  viewReports(): void {
    console.log('Navigate to analytics and reports');
  }

  handleStatAction(action: any): void {
    console.log('Stat action clicked:', action);
  }

  handleActionClick(action: any): void {
    console.log('Action button clicked:', action);
    switch (action.id) {
      case 'add-camp':
        this.addNewCamp();
        break;
      case 'add-sanatorium':
        this.addNewSanatorium();
        break;
      case 'manage-users':
        this.manageUsers();
        break;
      case 'analytics':
        this.viewReports();
        break;
      default:
        console.log('Unknown action:', action.id);
    }
  }

  handleFacilityClick(facility: ImageCardData): void {
    console.log('Facility clicked:', facility.title);
  }

  handleFacilityAction(event: {action: string, data: ImageCardData}): void {
    console.log('Facility action:', event.action, 'for', event.data.title);
    switch (event.action) {
      case 'edit':
        this.editFacility(event.data);
        break;
      case 'view':
        this.viewFacilityDetails(event.data);
        break;
      default:
        console.log('Unknown facility action:', event.action);
    }
  }

  private editFacility(facility: ImageCardData): void {
    console.log('Edit facility:', facility.title);
  }

  private viewFacilityDetails(facility: ImageCardData): void {
    console.log('View facility details:', facility.title);
  }

  trackByFacility(index: number, facility: ImageCardData): string {
    return facility.id;
  }
}