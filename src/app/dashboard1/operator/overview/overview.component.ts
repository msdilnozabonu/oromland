import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService, Notification } from '../../../services/notification.service';
import { NotificationPanelComponent } from '../../../shared/components/notification-panel/notification-panel.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatBadgeModule, 
    MatMenuModule, 
    MatButtonModule, 
    MatIconModule,
    NotificationPanelComponent
  ],
  template: `
    <div class="overview-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h1 class="page-title">Operator Overview</h1>
            <p class="page-subtitle">Monitor users, documents, and feedback</p>
          </div>
          <div class="header-actions">
            <app-notification-panel [showForRole]="'operator'"></app-notification-panel>
            <mat-menu #notificationMenu="matMenu" class="notification-menu">
              <div class="notification-header">
                <h3>Notifications</h3>
                <button mat-button (click)="markAllAsRead()" [disabled]="unreadCount === 0">
                  Mark all read
                </button>
              </div>
              <div class="notification-list">
                <div *ngFor="let notification of notifications" 
                     class="notification-item"
                     [class.unread]="!notification.read"
                     (click)="handleNotificationClick(notification)">
                  <div class="notification-icon" [ngClass]="'icon-' + notification.type">
                    <mat-icon>{{getNotificationIcon(notification.type)}}</mat-icon>
                  </div>
                  <div class="notification-content">
                    <h4>{{notification.title}}</h4>
                    <p>{{notification.message}}</p>
                    <span class="notification-time">{{getTimeAgo(notification.timestamp)}}</span>
                  </div>
                  <div class="notification-priority" [ngClass]="'priority-' + notification.priority">
                    <mat-icon *ngIf="notification.priority === 'urgent'">priority_high</mat-icon>
                  </div>
                </div>
                <div *ngIf="notifications.length === 0" class="no-notifications">
                  <mat-icon>notifications_none</mat-icon>
                  <p>No notifications</p>
                </div>
              </div>
            </mat-menu>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="material-icons">people</i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{totalUsers}}</div>
            <div class="stat-label">Total Users</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="material-icons">description</i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{totalDocuments}}</div>
            <div class="stat-label">Total Documents</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="material-icons">feedback</i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{totalFeedbacks}}</div>
            <div class="stat-label">Total Feedbacks</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="material-icons">pending_actions</i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{pendingTasks}}</div>
            <div class="stat-label">Pending Tasks</div>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h3 class="section-title">Quick Actions</h3>
        <div class="actions-grid">
          <a routerLink="../users" class="action-card">
            <div class="action-icon">
              <i class="material-icons">people</i>
            </div>
            <div class="action-content">
              <h4>User Management</h4>
              <p>View and manage user accounts</p>
            </div>
          </a>

          <a routerLink="../documents" class="action-card">
            <div class="action-icon">
              <i class="material-icons">description</i>
            </div>
            <div class="action-content">
              <h4>Documents</h4>
              <p>Review and process documents</p>
            </div>
          </a>

          <a routerLink="../feedbacks" class="action-card">
            <div class="action-icon">
              <i class="material-icons">feedback</i>
            </div>
            <div class="action-content">
              <h4>Feedbacks</h4>
              <p>Monitor and respond to feedback</p>
            </div>
          </a>
        </div>
      </div>
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
    }

    .page-subtitle {
      font-size: 1.1rem;
      color: #6b7280;
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .notification-btn {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      
      &:hover {
        background: #e9ecef;
      }
    }

    ::ng-deep .notification-menu {
      .mat-mdc-menu-panel {
        width: 400px;
        max-width: 90vw;
        max-height: 500px;
      }
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;

      h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
      }
    }

    .notification-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #f1f3f4;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background: #f8f9fa;
      }

      &.unread {
        background: #e8f5e9;
        border-left: 3px solid #4CAF50;
      }
    }

    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.icon-message {
        background: #e3f2fd;
        color: #1976d2;
      }

      &.icon-call {
        background: #fff3e0;
        color: #f57c00;
      }

      &.icon-feedback {
        background: #f3e5f5;
        color: #7b1fa2;
      }

      &.icon-booking {
        background: #e8f5e8;
        color: #4caf50;
      }

      &.icon-document {
        background: #fff8e1;
        color: #ffa000;
      }

      &.icon-system {
        background: #fce4ec;
        color: #c2185b;
      }
    }

    .notification-content {
      flex: 1;

      h4 {
        margin: 0 0 0.25rem 0;
        font-size: 0.9rem;
        font-weight: 600;
        color: #333;
      }

      p {
        margin: 0 0 0.5rem 0;
        font-size: 0.8rem;
        color: #666;
        line-height: 1.4;
      }

      .notification-time {
        font-size: 0.75rem;
        color: #999;
      }
    }

    .notification-priority {
      &.priority-urgent mat-icon {
        color: #f44336;
        animation: pulse 2s infinite;
      }
    }

    .no-notifications {
      text-align: center;
      padding: 2rem;
      color: #999;

      mat-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        margin-bottom: 1rem;
      }

      p {
        margin: 0;
      }
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 15px rgba(76, 175, 80, 0.08);
      border: 1px solid #e8f5e8;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(76, 175, 80, 0.15);
      }
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
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 1.5rem;
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
      text-decoration: none;
      color: inherit;
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
    }
  `]
})
export class OverviewComponent implements OnInit, OnDestroy {
  totalUsers = 1247;
  totalDocuments = 3456;
  totalFeedbacks = 189;
  pendingTasks = 23;
  
  notifications: Notification[] = [];
  unreadCount = 0;
  private subscriptions = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadStatistics();
    this.subscribeToNotifications();
    this.notificationService.simulateRealTimeNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private subscribeToNotifications(): void {
    this.subscriptions.add(
      this.notificationService.getOperatorNotifications().subscribe(notifications => {
        this.notifications = notifications;
      })
    );

    this.subscriptions.add(
      this.notificationService.getUnreadCount().subscribe(count => {
        this.unreadCount = count;
      })
    );
  }

  private loadStatistics(): void {
    // Load operator-specific statistics from backend
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  handleNotificationClick(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      // Navigate to the specific page
      console.log('Navigate to:', notification.actionUrl);
    }
  }

  getNotificationIcon(type: string): string {
    const icons = {
      message: 'message',
      call: 'phone',
      feedback: 'feedback',
      booking: 'book_online',
      document: 'description',
      system: 'settings'
    };
    return icons[type as keyof typeof icons] || 'notifications';
  }

  getTimeAgo(timestamp: Date | undefined): string {
    if (!timestamp) return '';
    
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }
}