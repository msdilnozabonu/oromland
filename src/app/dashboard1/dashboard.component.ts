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
      <mat-toolbar class="dashboard-toolbar">
        <button mat-icon-button (click)="toggleSidenav()" class="menu-button">
          <mat-icon>menu</mat-icon>
        </button>
        
        <span class="toolbar-title">{{dashboardConfig?.displayName || 'Dashboard'}}</span>
        
        <div class="toolbar-spacer"></div>
        
        <button mat-button [matMenuTriggerFor]="langMenu" class="lang-button">
          <mat-icon>language</mat-icon>
          {{currentLang}}
        </button>
        <mat-menu #langMenu="matMenu">
          <button mat-menu-item *ngFor="let lang of languages" (click)="changeLang(lang.code)">
            {{lang.label}}
          </button>
        </mat-menu>
        
        <button mat-button [matMenuTriggerFor]="userMenu" class="user-button">
          <mat-icon>account_circle</mat-icon>
          {{userName}}
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </mat-menu>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened class="sidenav">
          <div class="sidenav-header">
            <div class="user-info">
              <div class="user-avatar">
                <mat-icon>account_circle</mat-icon>
              </div>
              <div class="user-details">
                <div class="user-name">{{userName}}</div>
                <div class="user-role">{{userRole}}</div>
              </div>
            </div>
          </div>
          
          <mat-nav-list class="nav-list">
            <a mat-list-item 
               *ngFor="let item of navigationItems" 
               [routerLink]="item.route"
               routerLinkActive="active"
               [routerLinkActiveOptions]="{ exact: item.exact || false }"
               class="nav-item">
              <mat-icon matListItemIcon>{{item.icon}}</mat-icon>
              <span matListItemTitle>{{item.label}}</span>
              <span matListItemMeta *ngIf="item.badge" class="badge">{{item.badge}}</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="main-content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .dashboard-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .dashboard-toolbar {
      background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
      z-index: 1000;
    }

    .menu-button {
      margin-right: 1rem;
    }

    .toolbar-title {
      font-size: 1.2rem;
      font-weight: 600;
    }

    .toolbar-spacer {
      flex: 1;
    }

    .lang-button, .user-button {
      margin-left: 0.5rem;
      color: white;
    }

    .sidenav-container {
      flex: 1;
      background: #f8fffe;
    }

    .sidenav {
      width: 280px;
      background: white;
      border-right: 1px solid #e8f5e8;
      box-shadow: 2px 0 8px rgba(76, 175, 80, 0.1);
    }

    .sidenav-header {
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

    .user-avatar mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
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

    .nav-list {
      padding: 1rem 0;
    }

    .nav-item {
      margin: 0.25rem 1rem;
      border-radius: 12px;
      transition: all 0.3s ease;
      color: #6b7280;

      &:hover {
        background: #f0fdf4;
        color: #4CAF50;
      }

      &.active {
        background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      }
    }

    .nav-item mat-icon {
      color: inherit;
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
    }

    .main-content {
      background: #f8fffe;
      min-height: 100%;
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 100%;
      }
      
      .toolbar-title {
        font-size: 1rem;
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
  }

  private loadUserData(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser && this.currentUser.role) {
      this.userName = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
      this.userRole = this.currentUser.role.name;
      
      // Load dashboard configuration
      this.dashboardConfig = this.dashboardService.getDashboardConfig(this.currentUser.roleId);
      this.navigationItems = this.dashboardService.getNavigationItems(this.currentUser.roleId);
    }
  }

  toggleSidenav(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
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