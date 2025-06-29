import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { ImageService } from '../../services/image.service';

export interface ImageCardData {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  type: 'sanatoriums' | 'camps';
  rating?: number;
  price?: number;
  location?: string;
  features?: string[];
  status?: 'active' | 'inactive' | 'pending';
  badge?: {
    text: string;
    color: string;
  };
  actions?: {
    primary?: { label: string; action: string; };
    secondary?: { label: string; action: string; };
  };
}

@Component({
  selector: 'app-image-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatRippleModule
  ],
  template: `
    <mat-card class="image-card" 
              [class]="'card-' + data.type"
              matRipple
              [matRippleColor]="getRippleColor()"
              (click)="handleCardClick()">
      
      <div class="card-image-container">
        <img [src]="displayImage" 
             [alt]="data.title"
             class="card-image"
             (error)="onImageError($event)"
             (load)="onImageLoad($event)">
        
        <div class="image-overlay">
          <div class="overlay-gradient"></div>
          <div class="overlay-content">
            <div class="card-badge" *ngIf="data.badge" [style.background]="data.badge.color">
              {{data.badge.text}}
            </div>
            <div class="card-rating" *ngIf="data.rating">
              <mat-icon class="star-icon">star</mat-icon>
              <span>{{data.rating}}</span>
            </div>
          </div>
        </div>

        <div class="card-status" [class]="'status-' + (data.status || 'active')">
          <mat-icon>{{getStatusIcon()}}</mat-icon>
        </div>

        <div class="image-loading" *ngIf="imageLoading">
          <div class="loading-spinner"></div>
        </div>
      </div>

      <mat-card-content class="card-content">
        <div class="card-header">
          <div class="card-title-section">
            <h3 class="card-title">{{data.title}}</h3>
            <p class="card-subtitle" *ngIf="data.subtitle">{{data.subtitle}}</p>
          </div>
          <div class="card-price" *ngIf="data.price">
            <span class="price-amount">\${{data.price}}</span>
            <span class="price-period">/night</span>
          </div>
        </div>

        <div class="card-location" *ngIf="data.location">
          <mat-icon class="location-icon">place</mat-icon>
          <span>{{data.location}}</span>
        </div>

        <p class="card-description" *ngIf="data.description">
          {{data.description}}
        </p>

        <div class="card-features" *ngIf="data.features && data.features.length > 0">
          <mat-chip-set>
            <mat-chip *ngFor="let feature of data.features.slice(0, 3)" 
                      class="feature-chip"
                      [color]="getFeatureChipColor()">
              <mat-icon>{{getFeatureIcon(feature)}}</mat-icon>
              {{feature}}
            </mat-chip>
            <mat-chip *ngIf="data.features.length > 3" 
                      class="more-features-chip"
                      color="accent">
              +{{data.features.length - 3}} more
            </mat-chip>
          </mat-chip-set>
        </div>
      </mat-card-content>

      <mat-card-actions class="card-actions" *ngIf="data.actions">
        <button *ngIf="data.actions.secondary" 
                mat-button 
                class="secondary-action"
                (click)="handleAction(data.actions.secondary.action, $event)">
          <mat-icon>{{getActionIcon(data.actions.secondary.action)}}</mat-icon>
          {{data.actions.secondary.label}}
        </button>
        
        <button *ngIf="data.actions.primary" 
                mat-raised-button 
                color="primary"
                class="primary-action"
                (click)="handleAction(data.actions.primary.action, $event)">
          <mat-icon>{{getActionIcon(data.actions.primary.action)}}</mat-icon>
          {{data.actions.primary.label}}
        </button>
      </mat-card-actions>

      <div class="card-decorations">
        <div class="decoration decoration-1" [style.background]="getDecorationColor()"></div>
        <div class="decoration decoration-2" [style.background]="getDecorationColor()"></div>
      </div>
    </mat-card>
  `,
  styles: [`
    .image-card {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);

      &:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

        .card-image {
          transform: scale(1.1);
        }

        .overlay-gradient {
          opacity: 0.7;
        }

        .overlay-content {
          opacity: 1;
          transform: translateY(0);
        }

        .card-decorations .decoration {
          animation: float 3s ease-in-out infinite;
        }
      }

      &.card-sanatoriums {
        border-left: 6px solid #2196F3;
      }

      &.card-camps {
        border-left: 6px solid #4CAF50;
      }
    }

    .card-image-container {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 2;
    }

    .overlay-gradient {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.1) 0%,
        rgba(0, 0, 0, 0.3) 50%,
        rgba(0, 0, 0, 0.6) 100%
      );
      opacity: 0.5;
      transition: opacity 0.3s ease;
    }

    .overlay-content {
      position: absolute;
      top: 1rem;
      left: 1rem;
      right: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      opacity: 0.8;
      transform: translateY(-10px);
      transition: all 0.3s ease;
    }

    .card-badge {
      background: rgba(244, 67, 54, 0.9);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .card-rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: rgba(255, 193, 7, 0.9);
      color: white;
      padding: 0.5rem 0.75rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);

      .star-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }
    }

    .card-status {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.3);
      z-index: 3;

      &.status-active {
        background: rgba(76, 175, 80, 0.9);
        color: white;
      }

      &.status-inactive {
        background: rgba(158, 158, 158, 0.9);
        color: white;
      }

      &.status-pending {
        background: rgba(255, 152, 0, 0.9);
        color: white;
        animation: pulse 2s infinite;
      }

      mat-icon {
        font-size: 1.2rem;
      }
    }

    .image-loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 4;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #4CAF50;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .card-content {
      padding: 1.5rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .card-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
      line-height: 1.3;
    }

    .card-subtitle {
      font-size: 0.9rem;
      color: #6b7280;
      margin: 0;
    }

    .card-price {
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .price-amount {
        font-size: 1.5rem;
        font-weight: 700;
        color: #4CAF50;
      }

      .price-period {
        font-size: 0.8rem;
        color: #6b7280;
      }
    }

    .card-location {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: #6b7280;
      font-size: 0.9rem;

      .location-icon {
        font-size: 1.2rem;
        width: 1.2rem;
        height: 1.2rem;
        color: #9E9E9E;
      }
    }

    .card-description {
      font-size: 0.95rem;
      color: #6b7280;
      line-height: 1.5;
      margin: 0 0 1rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-features {
      margin-bottom: 1rem;

      mat-chip-set {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .feature-chip {
        font-size: 0.8rem;
        height: 32px;

        mat-icon {
          font-size: 1rem;
          width: 1rem;
          height: 1rem;
        }
      }

      .more-features-chip {
        font-size: 0.75rem;
        height: 28px;
      }
    }

    .card-actions {
      padding: 0 1.5rem 1.5rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        border-radius: 12px;
        font-weight: 500;

        mat-icon {
          font-size: 1.2rem;
        }
      }

      .secondary-action {
        color: #6b7280;

        &:hover {
          background: rgba(0, 0, 0, 0.05);
        }
      }

      .primary-action {
        background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);

        &:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
        }
      }
    }

    .card-decorations {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 1;
    }

    .decoration {
      position: absolute;
      border-radius: 50%;
      opacity: 0.1;

      &.decoration-1 {
        width: 20px;
        height: 20px;
        top: 20%;
        right: 15%;
        animation-delay: 0s;
      }

      &.decoration-2 {
        width: 12px;
        height: 12px;
        bottom: 30%;
        left: 10%;
        animation-delay: 1s;
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    @media (max-width: 768px) {
      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .card-actions {
        flex-direction: column;
        gap: 0.5rem;

        button {
          width: 100%;
          justify-content: center;
        }
      }

      .overlay-content {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class ImageCardComponent implements OnInit {
  @Input() data!: ImageCardData;
  @Output() cardClick = new EventEmitter<ImageCardData>();
  @Output() actionClick = new EventEmitter<{action: string, data: ImageCardData}>();

  displayImage = '';
  imageLoading = true;

  constructor(private imageService: ImageService) {}

  ngOnInit(): void {
    this.setDisplayImage();
  }

  private setDisplayImage(): void {
    this.displayImage = this.imageService.getImageWithFallback(
      this.data.imageUrl, 
      this.data.type
    );
  }

  onImageLoad(event: Event): void {
    this.imageLoading = false;
  }

  onImageError(event: Event): void {
    this.imageLoading = false;
    this.displayImage = this.imageService.getDefaultImage(this.data.type);
  }

  handleCardClick(): void {
    this.cardClick.emit(this.data);
  }

  handleAction(action: string, event: Event): void {
    event.stopPropagation();
    this.actionClick.emit({ action, data: this.data });
  }

  getRippleColor(): string {
    return this.data.type === 'sanatoriums' ? '#2196F320' : '#4CAF5020';
  }

  getStatusIcon(): string {
    const icons = {
      active: 'check_circle',
      inactive: 'cancel',
      pending: 'schedule'
    };
    return icons[this.data.status || 'active'];
  }

  getFeatureChipColor(): string {
    return this.data.type === 'sanatoriums' ? 'primary' : 'accent';
  }

  getFeatureIcon(feature: string): string {
    const icons: {[key: string]: string} = {
      'WiFi': 'wifi',
      'Pool': 'pool',
      'Spa': 'spa',
      'Restaurant': 'restaurant',
      'Gym': 'fitness_center',
      'Parking': 'local_parking',
      'Beach': 'beach_access',
      'Kids Club': 'child_care',
      'Medical': 'local_hospital',
      'Nature': 'nature',
      'Activities': 'sports_esports',
      'Transport': 'directions_bus'
    };
    return icons[feature] || 'star';
  }

  getActionIcon(action: string): string {
    const icons: {[key: string]: string} = {
      'book': 'book_online',
      'view': 'visibility',
      'edit': 'edit',
      'delete': 'delete',
      'favorite': 'favorite',
      'share': 'share',
      'info': 'info'
    };
    return icons[action] || 'arrow_forward';
  }

  getDecorationColor(): string {
    return this.data.type === 'sanatoriums' ? '#2196F3' : '#4CAF50';
  }
}