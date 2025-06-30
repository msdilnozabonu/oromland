import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../services/token.service';
import { AuthService } from '../../services/auth.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-token-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card mt-3" *ngIf="showTokenInfo">
      <div class="card-header">
        <h6 class="mb-0">
          <i class="fas fa-key me-2"></i>Token Status
          <button class="btn btn-sm btn-outline-secondary float-end" (click)="toggleVisibility()">
            <i class="fas" [class.fa-eye]="!showTokenInfo" [class.fa-eye-slash]="showTokenInfo"></i>
          </button>
        </h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <div class="mb-2">
              <small class="text-muted">Access Token Status:</small>
              <div>
                <span class="badge" [class.bg-success]="isTokenValid" [class.bg-danger]="!isTokenValid">
                  {{ isTokenValid ? 'Valid' : 'Invalid/Expired' }}
                </span>
              </div>
            </div>
            
            <div class="mb-2">
              <small class="text-muted">Refresh Token:</small>
              <div>
                <span class="badge" [class.bg-info]="hasRefreshToken" [class.bg-secondary]="!hasRefreshToken">
                  {{ hasRefreshToken ? 'Available' : 'Not Available' }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="mb-2" *ngIf="tokenExpiry">
              <small class="text-muted">Token Expires:</small>
              <div class="small">{{ tokenExpiry | date:'medium' }}</div>
            </div>
            
            <div class="mb-2" *ngIf="decodedToken">
              <small class="text-muted">User Role:</small>
              <div>
                <span class="badge bg-primary">{{ decodedToken.role || 'Unknown' }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-3" *ngIf="decodedToken">
          <small class="text-muted">Token Payload:</small>
          <pre class="small bg-light p-2 rounded">{{ decodedToken | json }}</pre>
        </div>
        
        <div class="mt-3">
          <button class="btn btn-sm btn-outline-primary me-2" (click)="refreshToken()" [disabled]="!hasRefreshToken">
            <i class="fas fa-sync me-1"></i>Refresh Token
          </button>
          <button class="btn btn-sm btn-outline-danger" (click)="clearTokens()">
            <i class="fas fa-trash me-1"></i>Clear Tokens
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
    }
    
    .card-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }
    
    pre {
      font-size: 0.75rem;
      max-height: 200px;
      overflow-y: auto;
    }
    
    .badge {
      font-size: 0.75em;
    }
  `]
})
export class TokenStatusComponent implements OnInit, OnDestroy {
  isTokenValid = false;
  hasRefreshToken = false;
  tokenExpiry: Date | null = null;
  decodedToken: any = null;
  showTokenInfo = false;
  
  private subscription = new Subscription();

  constructor(
    private tokenService: TokenService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check if user is authenticated to show token info
    this.showTokenInfo = this.authService.isAuthenticated();
    
    // Update token status every 30 seconds
    this.subscription.add(
      interval(30000).subscribe(() => this.updateTokenStatus())
    );
    
    // Initial update
    this.updateTokenStatus();
    
    // Listen for token refresh events
    this.subscription.add(
      this.tokenService.getTokenRefreshSubject().subscribe(() => {
        this.updateTokenStatus();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private updateTokenStatus() {
    this.isTokenValid = this.tokenService.isTokenValid();
    this.hasRefreshToken = this.tokenService.hasRefreshToken();
    this.tokenExpiry = this.tokenService.getTokenExpiry();
    
    const accessToken = this.tokenService.getAccessToken();
    if (accessToken) {
      this.decodedToken = this.tokenService.decodeToken(accessToken);
    }
    
    this.showTokenInfo = this.authService.isAuthenticated();
  }

  refreshToken() {
    this.tokenService.refreshAccessToken().subscribe({
      next: () => {
        console.log('Token refreshed successfully');
        this.updateTokenStatus();
      },
      error: (error) => {
        console.error('Token refresh failed:', error);
      }
    });
  }

  clearTokens() {
    this.tokenService.clearTokens();
    this.authService.logout();
    this.updateTokenStatus();
  }

  toggleVisibility() {
    this.showTokenInfo = !this.showTokenInfo;
  }
}