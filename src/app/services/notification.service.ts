import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {
    this.initializeOperatorNotifications();
    this.simulateRealTimeNotifications();
  }

  // Client-side notifications (unchanged from your implementation)
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

    if (!newNotification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => this.remove(id), newNotification.duration);
    }

    return id;
  }

  // All your existing convenience methods (success, error, warning, etc.)
  // ... [keep all your existing client notification methods] ...

  // Backend-connected operator notifications
  getOperatorNotifications(): Observable<Notification[]> {
    // First try to get from backend
    return this.http.get<Notification[]>(`${this.apiUrl}/operator`).pipe(
      tap(notifications => {
        this.operatorNotifications$.next(notifications);
        this.updateUnreadCount();
      }),
      catchError(() => {
        // Fall back to mock data if API fails
        return this.operatorNotifications$.asObservable();
      })
    );
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  addOperatorNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Observable<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    // Try to send to backend first
    return this.http.post<Notification>(`${this.apiUrl}/operator`, newNotification).pipe(
      tap(createdNotification => {
        // Update local state with response from server
        const currentNotifications = this.operatorNotifications$.value;
        this.operatorNotifications$.next([createdNotification, ...currentNotifications]);
        this.updateUnreadCount();
      }),
      catchError(error => {
        // If backend fails, add locally
        const currentNotifications = this.operatorNotifications$.value;
        this.operatorNotifications$.next([newNotification, ...currentNotifications]);
        this.updateUnreadCount();
        return of(newNotification);
      })
    );
  }

  markAsRead(notificationId: string): Observable<void> {
    // Try to update on backend first
    return this.http.patch<void>(`${this.apiUrl}/operator/${notificationId}/read`, {}).pipe(
      tap(() => {
        // Update local state
        const notifications = this.operatorNotifications$.value.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
        this.operatorNotifications$.next(notifications);
        this.updateUnreadCount();
      }),
      catchError(error => {
        // If backend fails, update locally
        const notifications = this.operatorNotifications$.value.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
        this.operatorNotifications$.next(notifications);
        this.updateUnreadCount();
        return of(undefined);
      })
    );
  }

  markAllAsRead(): Observable<void> {
    // Try to update on backend first
    return this.http.post<void>(`${this.apiUrl}/operator/mark-all-read`, {}).pipe(
      tap(() => {
        // Update local state
        const notifications = this.operatorNotifications$.value.map(n => ({ ...n, read: true }));
        this.operatorNotifications$.next(notifications);
        this.updateUnreadCount();
      }),
      catchError(error => {
        // If backend fails, update locally
        const notifications = this.operatorNotifications$.value.map(n => ({ ...n, read: true }));
        this.operatorNotifications$.next(notifications);
        this.updateUnreadCount();
        return of(undefined);
      })
    );
  }

  // Real-time notification handling
  initializeRealTimeConnection(): void {
    // This would connect to your real-time service (WebSocket, SignalR, etc.)
    // For now, we'll keep your simulation
    this.simulateRealTimeNotifications();
  }

  private updateUnreadCount(): void {
    const unreadCount = this.operatorNotifications$.value.filter(n => !n.read).length;
    this.unreadCount$.next(unreadCount);
  }

  private initializeOperatorNotifications(): void {
    // Initial load from backend
    this.getOperatorNotifications().subscribe();
  }

  // Keep your existing simulation methods
  simulateRealTimeNotifications(): void {
    setInterval(() => {
      if (Math.random() > 0.8) {
        this.addRandomOperatorNotification().subscribe();
      }
    }, 30000);
  }

  private addRandomOperatorNotification(): Observable<Notification> {
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

    return this.addOperatorNotification({
      type: randomType,
      title: notifications[randomType].title,
      message: notifications[randomType].message,
      priority: randomPriority
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Client-side notification methods (unchanged)
  remove(id: string): void {
    const currentNotifications = this.notifications$.value;
    this.notifications$.next(currentNotifications.filter(n => n.id !== id));
  }

  clear(): void {
    this.notifications$.next([]);
  }
}