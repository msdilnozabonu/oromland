import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HttpErrorHandlerService } from './http-error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly timeout = 30000; // 30 seconds timeout

  constructor(
    private http: HttpClient,
    private errorHandler: HttpErrorHandlerService
  ) {}

  // GET request
  get<T>(endpoint: string, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    const url = this.buildUrl(endpoint);
    const options = {
      params,
      headers: this.buildHeaders(headers)
    };

    return this.http.get<T>(url, options).pipe(
      timeout(this.timeout),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // POST request
  post<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    const url = this.buildUrl(endpoint);
    const options = {
      headers: this.buildHeaders(headers)
    };

    return this.http.post<T>(url, body, options).pipe(
      timeout(this.timeout),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // PUT request
  put<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    const url = this.buildUrl(endpoint);
    const options = {
      headers: this.buildHeaders(headers)
    };

    return this.http.put<T>(url, body, options).pipe(
      timeout(this.timeout),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // DELETE request
  delete<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
    const url = this.buildUrl(endpoint);
    const options = {
      headers: this.buildHeaders(headers)
    };

    return this.http.delete<T>(url, options).pipe(
      timeout(this.timeout),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Test connection to backend
  testConnection(): Observable<any> {
    return this.get('/dashboard').pipe(
      catchError((error) => {
        console.error('Backend connection test failed:', error);
        return throwError(() => error);
      })
    );
  }

  private buildUrl(endpoint: string): string {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // If endpoint already contains the full URL, return as is
    if (cleanEndpoint.startsWith('http')) {
      return cleanEndpoint;
    }
    
    // Build URL with base API URL
    return `${environment.apiUrl}/${cleanEndpoint}`;
  }

  private buildHeaders(customHeaders?: HttpHeaders): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (customHeaders) {
      customHeaders.keys().forEach(key => {
        headers = headers.set(key, customHeaders.get(key) || '');
      });
    }

    return headers;
  }

  // Helper method to build query parameters
  buildParams(params: { [key: string]: any }): HttpParams {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    
    return httpParams;
  }
}