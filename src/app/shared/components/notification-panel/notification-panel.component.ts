import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { NotificationService, Notification } from '../../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatChipsModule
  ],
  template: `
    <div class="notification-panel">
      <button mat-icon-button [matMenuTriggerFor]="notificationMenu" class="notification-trigger">
        <mat-icon [matBadge]="unreadCount" [matBadgeHidden]="unreadCount === 0" matBadgeColor="warn" matBadgeSize="small">
          notifications
        </mat-icon>
      </button>

      <mat-menu #notificationMenu="matMenu" class="notification-menu" xPosition="before">
        <div class="notification-header" (click)="$event.stopPropagation()">
          <div class="header-title">
            <mat-icon>notifications_active</mat-icon>
            <h3>Notifications</h3>
            <mat-chip [color]="unreadCount > 0 ? 'warn' : 'primary'" class="count-chip">
              {{notifications.length}}
            </mat-chip>
          </div>
          <div class="header-actions">
            <button mat-icon-button (click)="markAllAsRead()" [disabled]="unreadCount === 0" matTooltip="Mark all as read">
              <mat-icon>done_all</mat-icon>
            </button>
            <button mat-icon-button (click)="clearAll()" matTooltip="Clear all">
              <mat-icon>clear_all</mat-icon>
            </button>
          </div>
        </div>

        <div class="notification-filters" (click)="$event.stopPropagation()">
          <mat-chip-set>
            <mat-chip 
              *ngFor="let filter of notificationFilters" 
              [class.selected]="activeFilter === filter.type"
              (click)="setFilter(filter.type)"
              [color]="filter.color">
              <mat-icon>{{filter.icon}}</mat-icon>
              {{filter.label}}
            </mat-chip>
          </mat-chip-set>
        </div>

        <div class="notification-list">
          <div *ngFor="let notification of filteredNotifications; trackBy: trackByNotification" 
               class="notification-item"
               [class.unread]="!notification.read"
               [class.urgent]="notification.priority === 'urgent'"
               (click)="handleNotificationClick(notification)">
            
            <div class="notification-avatar" [ngClass]="'avatar-' + notification.type">
              <mat-icon>{{getNotificationIcon(notification.type)}}</mat-icon>
              <div *ngIf="notification.priority === 'urgent'" class="urgent-indicator">
                <mat-icon>priority_high</mat-icon>
              </div>
            </div>

            <div class="notification-content">
              <div class="notification-header-item">
                <h4>{{notification.title}}</h4>
                <div class="notification-meta">
                  <mat-chip [color]="getPriorityColor(notification.priority || 'medium')" class="priority-chip">
                    {{notification.priority || 'medium'}}
                  </mat-chip>
                  <span class="notification-time">{{getTimeAgo(notification.timestamp)}}</span>
                </div>
              </div>
              <p>{{notification.message}}</p>
              <div class="notification-actions" *ngIf="notification.actionUrl">
                <button mat-button color="primary" class="action-btn">
                  <mat-icon>open_in_new</mat-icon>
                  View Details
                </button>
              </div>
            </div>

            <div class="notification-status">
              <button mat-icon-button (click)="toggleRead(notification, $event)" class="read-btn">
                <mat-icon>{{notification.read ? 'mark_email_read' : 'mark_email_unread'}}</mat-icon>
              </button>
              <button mat-icon-button (click)="removeNotification(notification.id, $event)" class="remove-btn">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>

          <div *ngIf="filteredNotifications.length === 0" class="no-notifications">
            <div class="empty-state">
              <mat-icon>{{getEmptyStateIcon()}}</mat-icon>
              <h4>{{getEmptyStateTitle()}}</h4>
              <p>{{getEmptyStateMessage()}}</p>
            </div>
          </div>
        </div>

        <div class="notification-footer" (click)="$event.stopPropagation()">
          <button mat-button color="primary" (click)="viewAllNotifications()" class="view-all-btn">
            <mat-icon>list</mat-icon>
            View All Notifications
          </button>
        </div>
      </mat-menu>
    </div>
  `,
  styles: [`
    .notification-panel {
      position: relative;
    }

    .notification-trigger {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.05);
      }

      mat-icon {
        color: #2d3748;
      }
    }

    ::ng-deep .notification-menu {
      .mat-mdc-menu-panel {
        width: 420px;
        max-width: 95vw;
        max-height: 600px;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
      }
    }

    .notification-header {
      padding: 1.5rem;
      border-bottom: 1px solid #f1f3f4;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;

      mat-icon {
        color: #4CAF50;
        font-size: 1.5rem;
      }

      h3 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
        color: #2d3748;
      }

      .count-chip {
        font-size: 0.75rem;
        height: 24px;
      }
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .notification-filters {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #f1f3f4;
      background: #fafbfc;

      mat-chip-set {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      mat-chip {
        font-size: 0.8rem;
        height: 32px;
        cursor: pointer;
        transition: all 0.3s ease;

        &.selected {
          background: #4CAF50 !important;
          color: white !important;
        }

        &:hover {
          transform: scale(1.05);
        }

        mat-icon {
          font-size: 1rem;
          width: 1rem;
          height: 1rem;
        }
      }
    }

    .notification-list {
      max-height: 400px;
      overflow-y: auto;
      background: white;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.5rem;
      border-bottom: 1px solid #f8f9fa;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;

      &:hover {
        background: #f8f9fa;
        transform: translateX(4px);
      }

      &.unread {
        background: linear-gradient(90deg, rgba(76, 175, 80, 0.05) 0%, rgba(255, 255, 255, 1) 100%);
        border-left: 4px solid #4CAF50;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(to bottom, #4CAF50, #66BB6A);
        }
      }

      &.urgent {
        background: linear-gradient(90deg, rgba(244, 67, 54, 0.05) 0%, rgba(255, 255, 255, 1) 100%);
        border-left: 4px solid #F44336;
        animation: urgentPulse 2s infinite;

        &::before {
          background: linear-gradient(to bottom, #F44336, #EF5350);
        }
      }

      &:last-child {
        border-bottom: none;
      }
    }

    .notification-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      &.avatar-message {
        background: linear-gradient(135deg, #2196F3 0%, #64B5F6 100%);
        color: white;
      }

      &.avatar-call {
        background: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%);
        color: white;
      }

      &.avatar-feedback {
        background: linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%);
        color: white;
      }

      &.avatar-booking {
        background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
        color: white;
      }

      &.avatar-document {
        background: linear-gradient(135deg, #FF5722 0%, #FF8A65 100%);
        color: white;
      }

      &.avatar-system {
        background: linear-gradient(135deg, #607D8B 0%, #90A4AE 100%);
        color: white;
      }

      mat-icon {
        font-size: 1.5rem;
      }

      .urgent-indicator {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 20px;
        height: 20px;
        background: #F44336;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        animation: pulse 2s infinite;

        mat-icon {
          font-size: 0.8rem;
          color: white;
        }
      }
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-header-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .notification-content h4 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: #2d3748;
      line-height: 1.3;
    }

    .notification-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .priority-chip {
      font-size: 0.7rem;
      height: 20px;
      text-transform: uppercase;
    }

    .notification-time {
      font-size: 0.75rem;
      color: #9E9E9E;
      white-space: nowrap;
    }

    .notification-content p {
      margin: 0 0 0.75rem 0;
      font-size: 0.85rem;
      color: #6b7280;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .notification-actions {
      margin-top: 0.75rem;

      .action-btn {
        font-size: 0.8rem;
        height: 32px;
        
        mat-icon {
          font-size: 1rem;
          width: 1rem;
          height: 1rem;
        }
      }
    }

    .notification-status {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      opacity: 0;
      transition: opacity 0.3s ease;

      button {
        width: 32px;
        height: 32px;
        
        mat-icon {
          font-size: 1rem;
        }
      }

      .read-btn {
        color: #4CAF50;
      }

      .remove-btn {
        color: #F44336;
      }
    }

    .notification-item:hover .notification-status {
      opacity: 1;
    }

    .no-notifications {
      padding: 3rem 2rem;
    }

    .empty-state {
      text-align: center;
      color: #9E9E9E;

      mat-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      h4 {
        margin: 0 0 0.5rem 0;
        font-weight: 500;
      }

      p {
        margin: 0;
        font-size: 0.9rem;
      }
    }

    .notification-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #f1f3f4;
      background: #fafbfc;
      text-align: center;

      .view-all-btn {
        width: 100%;
        height: 40px;
        font-weight: 500;

        mat-icon {
          font-size: 1.2rem;
        }
      }
    }

    @keyframes urgentPulse {
      0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); }
      100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    @media (max-width: 768px) {
      ::ng-deep .notification-menu .mat-mdc-menu-panel {
        width: 100vw;
        max-width: 100vw;
        left: 0 !important;
        right: 0 !important;
        margin: 0;
        border-radius: 0;
      }

      .notification-item {
        padding: 1rem;
      }

      .notification-avatar {
        width: 40px;
        height: 40px;

        mat-icon {
          font-size: 1.2rem;
        }
      }
    }
  `]
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  @Input() showForRole: 'operator' | 'manager' | 'admin' = 'operator';

  notifications: Notification[] = [];
  unreadCount = 0;
  activeFilter = 'all';
  filteredNotifications: Notification[] = [];

  notificationFilters = [
    { type: 'all', label: 'All', icon: 'notifications', color: 'primary' },
    { type: 'message', label: 'Messages', icon: 'message', color: 'accent' },
    { type: 'call', label: 'Calls', icon: 'phone', color: 'warn' },
    { type: 'feedback', label: 'Feedback', icon: 'feedback', color: '' },
    { type: 'booking', label: 'Bookings', icon: 'book_online', color: 'primary' },
    { type: 'urgent', label: 'Urgent', icon: 'priority_high', color: 'warn' }
  ];

  private subscriptions = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscribeToNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private subscribeToNotifications(): void {
    this.subscriptions.add(
      this.notificationService.getOperatorNotifications().subscribe(notifications => {
        this.notifications = notifications;
        this.applyFilter();
      })
    );

    this.subscriptions.add(
      this.notificationService.getUnreadCount().subscribe(count => {
        this.unreadCount = count;
      })
    );
  }

  setFilter(filterType: string): void {
    this.activeFilter = filterType;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.activeFilter === 'all') {
      this.filteredNotifications = this.notifications;
    } else if (this.activeFilter === 'urgent') {
      this.filteredNotifications = this.notifications.filter(n => n.priority === 'urgent');
    } else {
      this.filteredNotifications = this.notifications.filter(n => n.type === this.activeFilter);
    }
  }

  handleNotificationClick(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      console.log('Navigate to:', notification.actionUrl);
    }
  }

  toggleRead(notification: Notification, event: Event): void {
    event.stopPropagation();
    if (notification.read) {
      // Mark as unread (would need service method)
      console.log('Mark as unread:', notification.id);
    } else {
      this.notificationService.markAsRead(notification.id);
    }
  }

  removeNotification(id: string, event: Event): void {
    event.stopPropagation();
    this.notificationService.remove(id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAll(): void {
    this.notificationService.clear();
  }

  viewAllNotifications(): void {
    console.log('Navigate to notifications page');
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

  getPriorityColor(priority: string): string {
    const colors = {
      low: '',
      medium: 'primary',
      high: 'accent',
      urgent: 'warn'
    };
    return colors[priority as keyof typeof colors] || '';
  }

  getTimeAgo(timestamp: Date | undefined): string {
    if (!timestamp) return '';
    
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  }

  getEmptyStateIcon(): string {
    if (this.activeFilter === 'urgent') return 'priority_high';
    if (this.activeFilter === 'all') return 'notifications_none';
    return this.getNotificationIcon(this.activeFilter);
  }

  getEmptyStateTitle(): string {
    if (this.activeFilter === 'all') return 'No notifications';
    if (this.activeFilter === 'urgent') return 'No urgent notifications';
    return `No ${this.activeFilter} notifications`;
  }

  getEmptyStateMessage(): string {
    if (this.activeFilter === 'urgent') return 'All caught up! No urgent items need your attention.';
    if (this.activeFilter === 'all') return 'You\'re all caught up! New notifications will appear here.';
    return `No ${this.activeFilter} notifications at the moment.`;
  }

  trackByNotification(index: number, notification: Notification): string {
    return notification.id;
  }
}