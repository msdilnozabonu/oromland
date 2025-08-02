import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, of } from 'rxjs';
import { catchError, map, switchMap, startWith, timeout } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

export interface NetworkStatus {
  isOnline: boolean;
  backendReachable: boolean;
  lastChecked: Date;
  latency?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private networkStatusSubject = new BehaviorSubject<NetworkStatus>({
    isOnline: true, // Default to true for SSR
    backendReachable: false,
    lastChecked: new Date()
  });

  public networkStatus$ = this.networkStatusSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeNetworkMonitoring();
  }

  private initializeNetworkMonitoring(): void {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Monitor browser online/offline status
    window.addEventListener('online', () => this.updateNetworkStatus());
    window.addEventListener('offline', () => this.updateNetworkStatus());

    // Check backend connectivity every 30 seconds
    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.checkBackendConnectivity())
    ).subscribe();
  }

  private updateNetworkStatus(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const currentStatus = this.networkStatusSubject.value;
    this.networkStatusSubject.next({
      ...currentStatus,
      isOnline: navigator.onLine,
      lastChecked: new Date()
    });

    if (navigator.onLine) {
      this.checkBackendConnectivity().subscribe();
    }
  }

  private checkBackendConnectivity(): Observable<NetworkStatus> {
    if (!isPlatformBrowser(this.platformId)) {
      // Return default status for SSR
      const status: NetworkStatus = {
        isOnline: true,
        backendReachable: false,
        lastChecked: new Date()
      };
      return of(status);
    }

    if (!navigator.onLine) {
      const status: NetworkStatus = {
        isOnline: false,
        backendReachable: false,
        lastChecked: new Date()
      };
      this.networkStatusSubject.next(status);
      return of(status);
    }

    const startTime = Date.now();
    
    return this.http.get(`${environment.apiUrl}/dashboard`, { 
      observe: 'response'
    }).pipe(
      timeout(10000),
      map(response => {
        const latency = Date.now() - startTime;
        const status: NetworkStatus = {
          isOnline: true,
          backendReachable: response.status === 200,
          lastChecked: new Date(),
          latency
        };
        this.networkStatusSubject.next(status);
        return status;
      }),
      catchError(error => {
        console.warn('Backend connectivity check failed:', error);
        const status: NetworkStatus = {
          isOnline: isPlatformBrowser(this.platformId) ? navigator.onLine : true,
          backendReachable: false,
          lastChecked: new Date()
        };
        this.networkStatusSubject.next(status);
        return of(status);
      })
    );
  }

  // Manual connectivity check
  checkConnectivity(): Observable<NetworkStatus> {
    return this.checkBackendConnectivity();
  }

  // Get current network status
  getCurrentStatus(): NetworkStatus {
    return this.networkStatusSubject.value;
  }

  // Check if we can reach a specific endpoint
  testEndpoint(endpoint: string): Observable<boolean> {
    const url = endpoint.startsWith('http') ? endpoint : `${environment.apiUrl}${endpoint}`;
    
    return this.http.get(url, { 
      observe: 'response'
    }).pipe(
      timeout(10000),
      map(response => response.status === 200),
      catchError(error => {
        console.warn(`Endpoint test failed for ${url}:`, error);
        return of(false);
      })
    );
  }

  // Diagnose connection issues
  diagnoseConnection(): Observable<{
    browserOnline: boolean;
    backendReachable: boolean;
    dnsResolution: boolean;
    corsIssue: boolean;
    sslIssue: boolean;
    timeoutIssue: boolean;
    errorDetails: any;
  }> {
    return this.http.get(`${environment.apiUrl}/dashboard`, { 
      observe: 'response'
    }).pipe(
      timeout(15000),
      map(response => ({
        browserOnline: isPlatformBrowser(this.platformId) ? navigator.onLine : true,
        backendReachable: true,
        dnsResolution: true,
        corsIssue: false,
        sslIssue: false,
        timeoutIssue: false,
        errorDetails: null
      })),
      catchError(error => {
        const diagnosis = {
          browserOnline: isPlatformBrowser(this.platformId) ? navigator.onLine : true,
          backendReachable: false,
          dnsResolution: true,
          corsIssue: false,
          sslIssue: false,
          timeoutIssue: false,
          errorDetails: error
        };

        // Analyze error type
        if (error.name === 'TimeoutError') {
          diagnosis.timeoutIssue = true;
        } else if (error.status === 0) {
          // Could be CORS, DNS, or network issue
          diagnosis.corsIssue = true;
          diagnosis.dnsResolution = false;
        } else if (error.status === 526 || error.message?.includes('SSL')) {
          diagnosis.sslIssue = true;
        }

        return of(diagnosis);
      })
    );
  }
}