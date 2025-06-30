import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../services/auth.service';
import { DashboardService, NavigationItem, DashboardConfig } from '../services/dashboard.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Mobile Header -->
      <div class="mobile-header d-lg-none">
        <button class="burger-menu" (click)="toggleMobileMenu()" [class.active]="isMobileMenuOpen">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <span class="mobile-title">{{dashboardConfig?.displayName || 'Dashboard'}}</span>
        <button class="mobile-user-btn" (click)="showUserMenu = !showUserMenu">
          <i class="fas fa-user-circle"></i>
        </button>
      </div>

      <!-- Mobile Menu Overlay -->
      <div class="mobile-menu-overlay" [class.active]="isMobileMenuOpen" (click)="closeMobileMenu()"></div>

      <!-- Sidebar -->
      <div class="sidebar" [class.mobile-open]="isMobileMenuOpen">
        <div class="sidebar-header">
          <div class="user-info">
            <div class="user-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="user-details">
              <div class="user-name">{{userName}}</div>
              <div class="user-role">{{userRole}}</div>
            </div>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <a *ngFor="let item of navigationItems" 
             [routerLink]="item.route"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: item.exact || false }"
             class="nav-item"
             (click)="closeMobileMenu()">
            <i class="{{item.icon}}"></i>
            <span>{{item.label}}</span>
            <span *ngIf="item.badge" class="badge">{{item.badge}}</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()">
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content" [class.shifted]="!isMobileMenuOpen">
        <router-outlet></router-outlet>
      </div>

      <!-- Mobile User Menu -->
      <div class="mobile-user-menu" [class.show]="showUserMenu" *ngIf="showUserMenu">
        <div class="user-menu-item" (click)="logout()">
          <i class="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      height: 100vh;
      display: flex;
      background-color: #ffffff;
    }

    /* Mobile Header */
    .mobile-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
    }

    .burger-menu {
      background: none;
      border: none;
      width: 30px;
      height: 24px;
      position: relative;
      cursor: pointer;
    }

    .burger-menu span {
      display: block;
      width: 100%;
      height: 3px;
      background: white;
      margin: 3px 0;
      transition: 0.3s;
    }

    .burger-menu.active span:nth-child(1) {
      transform: rotate(-45deg) translate(-5px, 6px);
    }

    .burger-menu.active span:nth-child(2) {
      opacity: 0;
    }

    .burger-menu.active span:nth-child(3) {
      transform: rotate(45deg) translate(-5px, -6px);
    }

    .mobile-title {
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .mobile-user-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
    }

    /* Mobile Menu Overlay */
    .mobile-menu-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 998;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .mobile-menu-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    /* Sidebar */
    .sidebar {
      width: 280px;
      height: 100vh;
      background: white;
      border-right: 1px solid #e8f5e8;
      box-shadow: 2px 0 8px rgba(76, 175, 80, 0.1);
      position: fixed;
      left: 0;
      top: 0;
      z-index: 999;
      transform: translateX(0);
      transition: transform 0.3s ease;
      overflow-y: auto;
    }

    @media (max-width: 991px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar.mobile-open {
        transform: translateX(0);
      }
    }

    .sidebar-header {
      padding: 2rem 1rem;
      background: linear-gradient(135deg, #f0fdf4 0%, #e8f5e8 100%);
      border-bottom: 1px solid #e8f5e8;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #4CAF50;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .user-avatar i {
      font-size: 2rem;
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 0.25rem;
    }

    .user-role {
      font-size: 0.9rem;
      color: #6b7280;
    }

    /* Navigation */
    .sidebar-nav {
      padding: 1rem 0;
      flex: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1.5rem;
      color: #6b7280;
      text-decoration: none;
      transition: all 0.3s ease;
      margin: 0.25rem 1rem;
      border-radius: 12px;
      position: relative;
    }

    .nav-item:hover {
      background: #f0fdf4;
      color: #4CAF50;
      text-decoration: none;
    }

    .nav-item.active {
      background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    .nav-item i {
      width: 20px;
      text-align: center;
    }

    .badge {
      background: #FFC107;
      color: #1a1a1a;
      border-radius: 12px;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      min-width: 20px;
      text-align: center;
      margin-left: auto;
    }

    /* Sidebar Footer */
    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid #e8f5e8;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
      padding: 0.75rem 1rem;
      background: none;
      border: none;
      color: #dc3545;
      text-align: left;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .logout-btn:hover {
      background: #f8d7da;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      background: #ffffff;
      min-height: 100vh;
      margin-left: 280px;
      transition: margin-left 0.3s ease;
    }

    @media (max-width: 991px) {
      .main-content {
        margin-left: 0;
        padding-top: 60px;
      }
    }

    /* Mobile User Menu */
    .mobile-user-menu {
      position: fixed;
      top: 60px;
      right: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
    }

    .mobile-user-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .user-menu-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      color: #dc3545;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .user-menu-item:hover {
      background: #f8d7da;
    }

    @media (min-width: 992px) {
      .mobile-header {
        display: none;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  userName = '';
  userRole = '';
  currentLang = 'EN';
  isMobileMenuOpen = false;
  showUserMenu = false;
  dashboardConfig: DashboardConfig | null = null;
  navigationItems: NavigationItem[] = [];

  languages = [
    { code: 'EN', label: 'English' },
    { code: 'RU', label: 'Russian' },
    { code: 'UZ', label: 'Uzbek' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadNavigationItems();
  }

  private loadUserData(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser && this.currentUser.role) {
      this.userName = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
      this.userRole = this.currentUser.role.name;
      
      // Load dashboard configuration
      this.dashboardConfig = this.dashboardService.getDashboardConfig(this.currentUser.roleId);
    }
  }

  private loadNavigationItems(): void {
    if (this.currentUser) {
      this.navigationItems = this.getNavigationItemsForRole(this.currentUser.role?.name as any);
    }
  }

  private getNavigationItemsForRole(role: string): NavigationItem[] {
    const baseItems: NavigationItem[] = [
      { 
        label: 'Overview', 
        icon: 'fas fa-tachometer-alt', 
        route: `/dashboard1/${role.toLowerCase()}/overview`,
        exact: true
      }
    ];

    switch (role) {
      case 'USER':
        return [
          ...baseItems,
          { label: 'My Bookings', icon: 'fas fa-calendar-check', route: '/dashboard1/user/bookings' },
          { label: 'Book Camp', icon: 'fas fa-campground', route: '/dashboard1/user/book-camp' },
          { label: 'Book Sanatorium', icon: 'fas fa-hospital', route: '/dashboard1/user/book-sanatorium' },
          { label: 'Profile', icon: 'fas fa-user-edit', route: '/dashboard1/user/profile' },
          { label: 'Reviews', icon: 'fas fa-star', route: '/dashboard1/user/reviews' }
        ];
      case 'ADMIN':
        return [
          ...baseItems,
          { label: 'Manage Bookings', icon: 'fas fa-list-alt', route: '/dashboard1/admin/bookings' },
          { label: 'Users', icon: 'fas fa-users', route: '/dashboard1/admin/users' },
          { label: 'Reports', icon: 'fas fa-chart-bar', route: '/dashboard1/admin/reports' }
        ];
      case 'SUPER_ADMIN':
        return [
          ...baseItems,
          { label: 'Role Management', icon: 'fas fa-user-shield', route: '/dashboard1/super-admin/roles' },
          { label: 'System Settings', icon: 'fas fa-cogs', route: '/dashboard1/super-admin/settings' },
          { label: 'All Bookings', icon: 'fas fa-list', route: '/dashboard1/super-admin/bookings' },
          { label: 'Analytics', icon: 'fas fa-analytics', route: '/dashboard1/super-admin/analytics' }
        ];
      default:
        return baseItems;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.showUserMenu = false;
  }

  changeLang(langCode: string): void {
    this.currentLang = langCode;
    // Implement language change logic
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}