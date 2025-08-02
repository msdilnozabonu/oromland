import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface ApiError {
  code: string;
  message: string;
  status: number;
  timestamp?: string;
  path?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HttpErrorHandlerService {

  constructor() { }

  handleError(error: HttpErrorResponse): Observable<never> {
    let apiError: ApiError;

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      apiError = {
        code: 'CLIENT_ERROR',
        message: `Network error: ${error.error.message}`,
        status: 0
      };
    } else {
      // Backend returned an unsuccessful response code
      apiError = {
        code: this.getErrorCode(error.status),
        message: this.getErrorMessage(error),
        status: error.status,
        timestamp: new Date().toISOString(),
        path: error.url || 'unknown'
      };
    }

    console.error('HTTP Error:', apiError);
    return throwError(() => apiError);
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case 0:
        return 'NETWORK_ERROR';
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 422:
        return 'VALIDATION_ERROR';
      case 429:
        return 'TOO_MANY_REQUESTS';
      case 500:
        return 'INTERNAL_SERVER_ERROR';
      case 502:
        return 'BAD_GATEWAY';
      case 503:
        return 'SERVICE_UNAVAILABLE';
      case 504:
        return 'GATEWAY_TIMEOUT';
      default:
        return `HTTP_${status}`;
    }
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    // Try to extract message from different possible response formats
    if (error.error?.message) {
      return error.error.message;
    }
    
    if (error.error?.error?.message) {
      return error.error.error.message;
    }
    
    if (typeof error.error === 'string') {
      return error.error;
    }

    // Default messages based on status code
    switch (error.status) {
      case 0:
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in and try again.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'Conflict occurred. The resource already exists or is in use.';
      case 422:
        return 'Validation failed. Please check your input and try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 502:
        return 'Bad gateway. The server is temporarily unavailable.';
      case 503:
        return 'Service unavailable. Please try again later.';
      case 504:
        return 'Gateway timeout. The server took too long to respond.';
      default:
        return `An unexpected error occurred (${error.status}). Please try again.`;
    }
  }

  isNetworkError(error: any): boolean {
    return error?.status === 0 || error?.code === 'NETWORK_ERROR';
  }

  isServerError(error: any): boolean {
    return error?.status >= 500;
  }

  isClientError(error: any): boolean {
    return error?.status >= 400 && error?.status < 500;
  }
}