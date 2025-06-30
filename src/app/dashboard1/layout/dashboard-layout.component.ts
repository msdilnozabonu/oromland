import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService, UserRole } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { Subscription } from 'rxjs';

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  rejectedBookings: number;
}

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
  roles?: UserRole[];
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatBadgeModule
  ],
  template: `
    <div class="dashboard-layout">
      <!-- Mobile Header -->
      <mat-toolbar class="mobile-header" *ngIf="isMobile">
        <button mat-icon-button (click)="toggleSidenav()" class="menu-button">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="app-title">Oromland</span>
        <span class="spacer"></span>
        <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-menu-button">
          <mat-icon>account_circle</mat-icon>
        </button>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <!-- Sidebar -->
        <mat-sidenav 
          #sidenav 
          class="dashboard-sidenav"
          [mode]="isMobile ? 'over' : 'side'"
          [opened]="!isMobile || sidenavOpened"
          [fixedInViewport]="isMobile"
          [autoFocus]="false">
          
          <!-- Desktop Header in Sidebar -->
          <div class="sidebar-header" *ngIf="!isMobile">
            <div class="logo-section">
              <img src="assets/images/logo.png" alt="Oromland" class="logo" 
                   onerror="this.src='assets/images/logo-default.png'">
              <h2>Oromland</h2>
            </div>
          </div>

          <!-- User Profile Section -->
          <div class="user-profile">
            <div class="user-avatar">
              <img [src]="currentUser?.avatar || 'assets/images/user-default.png'" 
                   [alt]="currentUser?.firstName">
            </div>
            <div class="user-info">
              <h3>{{getWelcomeMessage()}}</h3>
              <p>{{currentUser?.firstName}} {{currentUser?.lastName}}</p>
              <span class="user-role">{{currentUser?.role?.name | titlecase}}</span>
            </div>
          </div>

          <!-- Dashboard Stats (for users) -->
          <div class="dashboard-stats" *ngIf="currentUser?.role?.name === 'USER' && stats">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{stats.totalBookings}}</div>
                <div class="stat-label">Total Bookings</div>
              </div>
              <div class="stat-item pending">
                <div class="stat-number">{{stats.pendingBookings}}</div>
                <div class="stat-label">Pending</div>
              </div>
              <div class="stat-item approved">
                <div class="stat-number">{{stats.approvedBookings}}</div>
                <div class="stat-label">Approved</div>
              </div>
            </div>
          </div>

          <!-- Navigation Menu -->
          <mat-nav-list class="navigation-list">
            <mat-list-item 
              *ngFor="let item of getMenuItems()" 
              [routerLink]="item.route"
              routerLinkActive="active-route"
              (click)="onMenuItemClick(item)"
              class="nav-item">
              
              <mat-icon matListItemIcon class="nav-icon">{{item.icon}}</mat-icon>
              <span matListItemTitle class="nav-label">{{item.label}}</span>
              <span matListItemMeta *ngIf="item.badge && item.badge > 0" 
                    class="nav-badge">{{item.badge}}</span>
            </mat-list-item>
          </mat-nav-list>

          <!-- Sidebar Footer -->
          <div class="sidebar-footer">
            <button mat-button class="logout-button" (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Logout</span>
            </button>
          </div>
        </mat-sidenav>

        <!-- Main Content -->
        <mat-sidenav-content class="main-content">
          <!-- Desktop Header -->
          <mat-toolbar class="desktop-header" *ngIf="!isMobile">
            <span class="spacer"></span>
            <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-menu-button">
              <mat-icon>account_circle</mat-icon>
            </button>
          </mat-toolbar>

          <!-- Content Area -->
          <div class="content-area">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>

      <!-- User Menu -->
      <mat-menu #userMenu="matMenu" class="user-menu">
        <button mat-menu-item (click)="viewProfile()">
          <mat-icon>person</mat-icon>
          <span>Profile</span>
        </button>
        <button mat-menu-item (click)="editAccount()">
          <mat-icon>settings</mat-icon>
          <span>Account Settings</span>
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="logout()">
          <mat-icon>exit_to_app</mat-icon>
          <span>Logout</span>
        </button>
      </mat-menu>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #ffffff;
    }

    .mobile-header {
      background: #ffffff;
      color: #2d3748;
      border-bottom: 1px solid #e2e8f0;
      position: fixed;
      top: 0;
      z-index: 100;
    }

    .mobile-header .app-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #4CAF50;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .sidenav-container {
      flex: 1;
      margin-top: 64px; /* Mobile header height */
    }

    .dashboard-sidenav {
      width: 280px;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
    }

    .sidebar-header {
      padding: 2rem 1.5rem 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo {
      width: 40px;
      height: 40px;
      border-radius: 8px;
    }

    .logo-section h2 {
      margin: 0;
      color: #4CAF50;
      font-weight: 700;
    }

    .user-profile {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
      color: white;
    }

    .user-avatar {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .user-avatar img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 3px solid rgba(255, 255, 255, 0.3);
    }

    .user-info {
      text-align: center;
    }

    .user-info h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .user-info p {
      margin: 0 0 0.5rem 0;
      opacity: 0.9;
    }

    .user-role {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
    }

    .dashboard-stats {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      border-radius: 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }

    .stat-item.pending {
      background: #fff8e1;
      border-color: #FFC107;
    }

    .stat-item.approved {
      background: #e8f5e8;
      border-color: #4CAF50;
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2d3748;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .navigation-list {
      padding: 1rem 0;
    }

    .nav-item {
      margin: 0.25rem 1rem;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      background: #f0f9f0;
    }

    .nav-item.active-route {
      background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
      color: white;
    }

    .nav-icon {
      color: #6b7280;
    }

    .nav-item.active-route .nav-icon {
      color: white;
    }

    .nav-label {
      font-weight: 500;
    }

    .nav-badge {
      background: #FFC107;
      color: #2d3748;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .sidebar-footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .logout-button {
      width: 100%;
      color: #dc2626;
      justify-content: flex-start;
      padding: 0.75rem 1rem;
    }

    .logout-button mat-icon {
      margin-right: 0.75rem;
    }

    .desktop-header {
      background: #ffffff;
      color: #2d3748;
      border-bottom: 1px solid #e2e8f0;
      padding: 0 2rem;
    }

    .main-content {
      background: #ffffff;
    }

    .content-area {
      padding: 0;
      min-height: calc(100vh - 64px);
      background: #ffffff;
    }

    .user-menu-button {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }

    /* Mobile Styles */
    @media (max-width: 768px) {
      .sidenav-container {
        margin-top: 64px;
      }

      .desktop-header {
        display: none;
      }

      .dashboard-sidenav {
        width: 100%;
        max-width: 300px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .user-profile {
        padding: 1rem;
      }

      .dashboard-stats {
        padding: 1rem;
      }

      .sidebar-footer {
        position: relative;
        padding: 1rem;
      }
    }

    @media (min-width: 769px) {
      .mobile-header {
        display: none;
      }

      .sidenav-container {
        margin-top: 0;
      }

      .content-area {
        min-height: calc(100vh - 64px);
      }
    }

    /* Welcome Message Animation */
    .user-info h3 {
      animation: fadeInDown 0.5s ease-out;
    }

    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  currentUser: any;
  stats: DashboardStats | null = null;
  isMobile = false;
  sidenavOpened = false;
  isNewUser = false;
  private subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private router: Router
  ) {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.checkIfNewUser();
    this.loadUserStats();
    
    // Listen to route changes to close mobile menu
    this.subscription.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd && this.isMobile) {
          this.sidenavOpened = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 769;
  }

  private checkIfNewUser(): void {
    // Check if user is new (no previous bookings or recent registration)
    const registrationDate = new Date(this.currentUser?.createdAt || new Date());
    const now = new Date();
    const daysSinceRegistration = Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    this.isNewUser = daysSinceRegistration <= 1; // Consider new if registered within 1 day
  }

  private loadUserStats(): void {
    if (this.currentUser?.role?.name === 'USER') {
      // Load user booking statistics
      this.bookingService.getUserBookingStats().subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.warn('Failed to load user stats:', error);
          // Set default stats for new users
          this.stats = {
            totalBookings: 0,
            pendingBookings: 0,
            approvedBookings: 0,
            rejectedBookings: 0
          };
        }
      });
    }
  }

  getWelcomeMessage(): string {
    if (this.isNewUser || (this.stats && this.stats.totalBookings === 0)) {
      return 'Welcome!';
    }
    return 'Welcome back!';
  }

  getMenuItems(): MenuItem[] {
    const userRole = this.currentUser?.role?.name as UserRole;
    
    const menuItems: MenuItem[] = [];

    switch (userRole) {
      case UserRole.SUPER_ADMIN:
        menuItems.push(
          { icon: 'dashboard', label: 'Overview', route: '/dashboard1/super-admin/overview' },
          { icon: 'people', label: 'User Management', route: '/dashboard1/super-admin/users' },
          { icon: 'security', label: 'Role Management', route: '/dashboard1/super-admin/roles' },
          { icon: 'assessment', label: 'System Reports', route: '/dashboard1/super-admin/reports' },
          { icon: 'settings', label: 'System Settings', route: '/dashboard1/super-admin/settings' }
        );
        break;

      case UserRole.ADMIN:
        menuItems.push(
          { icon: 'dashboard', label: 'Overview', route: '/dashboard1/admin/overview' },
          { icon: 'book', label: 'Manage Bookings', route: '/dashboard1/admin/bookings' },
          { icon: 'people', label: 'Users', route: '/dashboard1/admin/users' },
          { icon: 'assessment', label: 'Reports', route: '/dashboard1/admin/reports' }
        );
        break;

      case UserRole.MANAGER:
        menuItems.push(
          { icon: 'dashboard', label: 'Overview', route: '/dashboard1/manager/overview' },
          { icon: 'book', label: 'Bookings', route: '/dashboard1/manager/bookings' },
          { icon: 'assessment', label: 'Reports', route: '/dashboard1/manager/reports' }
        );
        break;

      case UserRole.OPERATOR:
        menuItems.push(
          { icon: 'dashboard', label: 'Overview', route: '/dashboard1/operator/overview' },
          { icon: 'book', label: 'Process Bookings', route: '/dashboard1/operator/bookings' }
        );
        break;

      default: // USER
        menuItems.push(
          { icon: 'dashboard', label: 'Overview', route: '/dashboard1/user/overview' },
          { icon: 'book', label: 'My Bookings', route: '/dashboard1/user/bookings', badge: this.stats?.pendingBookings },
          { icon: 'add_circle', label: 'Book Camp', route: '/dashboard1/user/book-camp' },
          { icon: 'local_hospital', label: 'Book Sanatorium', route: '/dashboard1/user/book-sanatorium' },
          { icon: 'rate_review', label: 'Reviews', route: '/dashboard1/user/reviews' },
          { icon: 'person', label: 'Profile', route: '/dashboard1/user/profile' }
        );
        break;
    }

    return menuItems;
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  onMenuItemClick(item: MenuItem): void {
    if (this.isMobile) {
      this.sidenavOpened = false;
    }
  }

  viewProfile(): void {
    this.router.navigate(['/dashboard1/user/profile']);
  }

  editAccount(): void {
    this.router.navigate(['/dashboard1/user/account-settings']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}