import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'message' | 'call' | 'feedback' | 'booking' | 'document' | 'system';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  timestamp?: Date;
  read?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: any;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private operatorNotifications$ = new BehaviorSubject<Notification[]>([]);
  private unreadCount$ = new BehaviorSubject<number>(0);
  private defaultDuration = 5000;

  constructor() {
    this.initializeOperatorNotifications();
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  show(notification: Omit<Notification, 'id'>): string {
    const id = this.generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? this.defaultDuration
    };

    const currentNotifications = this.notifications$.value;
    this.notifications$.next([...currentNotifications, newNotification]);

    // Auto-remove notification after duration (unless persistent)
    if (!newNotification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newNotification.duration);
    }

    return id;
  }

  success(title: string, message: string, options?: Partial<Notification>): string {
    return this.show({
      type: 'success',
      title,
      message,
      ...options
    });
  }

  error(title: string, message: string, options?: Partial<Notification>): string {
    return this.show({
      type: 'error',
      title,
      message,
      persistent: true, // Errors should be persistent by default
      ...options
    });
  }

  warning(title: string, message: string, options?: Partial<Notification>): string {
    return this.show({
      type: 'warning',
      title,
      message,
      ...options
    });
  }

  info(title: string, message: string, options?: Partial<Notification>): string {
    return this.show({
      type: 'info',
      title,
      message,
      ...options
    });
  }

  remove(id: string): void {
    const currentNotifications = this.notifications$.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notifications$.next(filteredNotifications);
  }

  clear(): void {
    this.notifications$.next([]);
  }

  // Convenience methods for common scenarios
  bookingCreated(): string {
    return this.success(
      'Booking Created',
      'Your booking has been created successfully. You will receive a confirmation email shortly.'
    );
  }

  documentUploaded(): string {
    return this.success(
      'Document Uploaded',
      'Your document has been uploaded and is now under review.'
    );
  }

  documentApproved(): string {
    return this.success(
      'Document Approved',
      'Your document has been approved by the manager.'
    );
  }

  documentRejected(reason?: string): string {
    return this.error(
      'Document Rejected',
      reason || 'Your document has been rejected. Please check the comments and resubmit.'
    );
  }

  profileUpdated(): string {
    return this.success(
      'Profile Updated',
      'Your profile information has been updated successfully.'
    );
  }

  networkError(): string {
    return this.error(
      'Network Error',
      'Unable to connect to the server. Please check your internet connection and try again.',
      {
        actions: [
          {
            label: 'Retry',
            action: () => window.location.reload(),
            style: 'primary'
          }
        ]
      }
    );
  }

  unauthorizedAccess(): string {
    return this.error(
      'Access Denied',
      'You do not have permission to access this resource.',
      {
        actions: [
          {
            label: 'Go to Dashboard',
            action: () => window.location.href = '/dashboard',
            style: 'primary'
          }
        ]
      }
    );
  }

  sessionExpired(): string {
    return this.warning(
      'Session Expired',
      'Your session has expired. Please log in again to continue.',
      {
        persistent: true,
        actions: [
          {
            label: 'Login',
            action: () => window.location.href = '/login',
            style: 'primary'
          }
        ]
      }
    );
  }

  maintenanceMode(): string {
    return this.info(
      'Maintenance Mode',
      'The system is currently under maintenance. Some features may be temporarily unavailable.',
      {
        persistent: true
      }
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  getOperatorNotifications(): Observable<Notification[]> {
    return this.operatorNotifications$.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  addOperatorNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    const currentNotifications = this.operatorNotifications$.value;
    const updatedNotifications = [newNotification, ...currentNotifications];
    
    this.operatorNotifications$.next(updatedNotifications);
    this.updateUnreadCount();
  }

  markAsRead(notificationId: string): void {
    const notifications = this.operatorNotifications$.value.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    
    this.operatorNotifications$.next(notifications);
    this.updateUnreadCount();
  }

  markAllAsRead(): void {
    const notifications = this.operatorNotifications$.value.map(n => ({ ...n, read: true }));
    this.operatorNotifications$.next(notifications);
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    const unreadCount = this.operatorNotifications$.value.filter(n => !n.read).length;
    this.unreadCount$.next(unreadCount);
  }

  private initializeOperatorNotifications(): void {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'message',
        title: 'New Message from User',
        message: 'John Doe sent you a message about booking inquiry',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        priority: 'high',
        actionUrl: '/dashboard/operator/messages',
        metadata: { userId: 'user123', userName: 'John Doe' }
      },
      {
        id: '2',
        type: 'call',
        title: 'Missed Call',
        message: 'Missed call from +998 90 123 45 67',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        priority: 'medium',
        actionUrl: '/dashboard/operator/calls',
        metadata: { phoneNumber: '+998 90 123 45 67' }
      },
      {
        id: '3',
        type: 'feedback',
        title: 'New Feedback Received',
        message: 'Sarah Wilson left a 5-star review for Charvak Lake Camp',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        priority: 'low',
        actionUrl: '/dashboard/operator/feedbacks',
        metadata: { rating: 5, placeId: 'camp2' }
      },
      {
        id: '4',
        type: 'booking',
        title: 'New Booking Request',
        message: 'New booking request for Wellness Sanatorium Tashkent',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        read: true,
        priority: 'high',
        actionUrl: '/dashboard/operator/bookings',
        metadata: { bookingId: 'book456', placeId: 'san1' }
      },
      {
        id: '5',
        type: 'system',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will begin at 2:00 AM tonight',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        priority: 'urgent',
        metadata: { maintenanceTime: '2:00 AM' }
      }
    ];

    this.operatorNotifications$.next(mockNotifications);
    this.updateUnreadCount();
  }

  simulateRealTimeNotifications(): void {
    setInterval(() => {
      if (Math.random() > 0.8) {
        this.addRandomOperatorNotification();
      }
    }, 30000);
  }

  private addRandomOperatorNotification(): void {
    const types: ('message' | 'call' | 'feedback' | 'booking')[] = ['message', 'call', 'feedback', 'booking'];
    const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    
    const notifications = {
      message: {
        title: 'New Message',
        message: 'You have received a new message from a user'
      },
      call: {
        title: 'Incoming Call',
        message: 'You have a new incoming call'
      },
      feedback: {
        title: 'New Feedback',
        message: 'A user has submitted new feedback'
      },
      booking: {
        title: 'Booking Update',
        message: 'There is a new booking request'
      }
    };

    this.addOperatorNotification({
      type: randomType,
      title: notifications[randomType].title,
      message: notifications[randomType].message,
      priority: randomPriority
    });
  }
}