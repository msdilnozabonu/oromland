import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { ImageCardComponent, ImageCardData } from '../image-card/image-card.component';
import { CreativeStatsComponent } from '../creative-stats/creative-stats.component';
import { ActionButtonsComponent } from '../action-buttons/action-buttons.component';
import { NotificationPanelComponent } from '../notification-panel/notification-panel.component';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-dashboard-showcase',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    ImageCardComponent,
    CreativeStatsComponent,
    ActionButtonsComponent,
    NotificationPanelComponent
  ],
  template: `
    <div class="showcase-container">
      <div class="showcase-header">
        <div class="header-content">
          <div class="header-left">
            <div class="showcase-avatar">
              <mat-icon>dashboard</mat-icon>
            </div>
            <div class="header-text">
              <h1 class="showcase-title">
                <mat-icon class="title-icon">auto_awesome</mat-icon>
                Creative Dashboard Showcase
              </h1>
              <p class="showcase-subtitle">Experience the power of modern design with default images</p>
            </div>
          </div>
          <div class="header-actions">
            <app-notification-panel [showForRole]="'operator'"></app-notification-panel>
          </div>
        </div>
      </div>

      <div class="showcase-section">
        <h2 class="section-title">
          <mat-icon>photo_library</mat-icon>
          Featured Facilities with Default Images
        </h2>
        <div class="facilities-grid">
          <app-image-card 
            *ngFor="let facility of showcaseFacilities; trackBy: trackByFacility"
            [data]="facility"
            (cardClick)="handleFacilityClick($event)"
            (actionClick)="handleFacilityAction($event)">
          </app-image-card>
        </div>
      </div>

      <div class="showcase-section">
        <h2 class="section-title">
          <mat-icon>analytics</mat-icon>
          Statistics
        </h2>
        <app-creative-stats 
          [type]="'admin'"
          class="showcase-stats">
        </app-creative-stats>
      </div>

      <div class="showcase-section">
        <h2 class="section-title">
          <mat-icon>touch_app</mat-icon>
          Interactive Action Buttons
        </h2>
        <app-action-buttons 
          [type]="'admin'"
          [showQuickActions]="true"
          (actionClick)="handleActionClick($event)"
          class="showcase-actions">
        </app-action-buttons>
      </div>

      <div class="showcase-features">
        <h2 class="section-title">
          <mat-icon>star</mat-icon>
          Creative Features Highlights
        </h2>
        <div class="features-grid">
          <mat-card class="feature-card glass-card">
            <div class="feature-icon-container">
              <mat-icon class="feature-icon">image</mat-icon>
            </div>
            <mat-card-content>
              <h3>Default Images Integration</h3>
              <p>Beautiful default images for sanatoriums and camps with automatic fallback system.</p>
              <div class="feature-demo">
                <img [src]="imageService.getDefaultImage('sanatoriums')" alt="Sanatorium" class="demo-image">
                <img [src]="imageService.getDefaultImage('camps')" alt="Camp" class="demo-image">
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="feature-card glass-card">
            <div class="feature-icon-container">
              <mat-icon class="feature-icon">auto_awesome</mat-icon>
            </div>
            <mat-card-content>
              <h3>Glass-morphism Design</h3>
              <p>Modern glass effects with backdrop blur and transparency throughout the interface.</p>
              <div class="glass-demo">
                <div class="glass-element">Glass Effect</div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="feature-card glass-card">
            <div class="feature-icon-container">
              <mat-icon class="feature-icon">animation</mat-icon>
            </div>
            <mat-card-content>
              <h3>Micro-animations</h3>
              <p>Smooth animations and transitions that enhance user experience.</p>
              <div class="animation-demo">
                <div class="floating-element">
                  <mat-icon>favorite</mat-icon>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="feature-card glass-card">
            <div class="feature-icon-container">
              <mat-icon class="feature-icon">palette</mat-icon>
            </div>
            <mat-card-content>
              <h3>Gradient System</h3>
              <p>Beautiful gradient colors that create visual hierarchy and appeal.</p>
              <div class="gradient-demo">
                <div class="gradient-sample gradient-1"></div>
                <div class="gradient-sample gradient-2"></div>
                <div class="gradient-sample gradient-3"></div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <div class="showcase-footer">
        <div class="footer-content">
          <div class="footer-stats">
            <div class="stat-item">
              <mat-icon>check_circle</mat-icon>
              <span>100% Complete</span>
            </div>
            <div class="stat-item">
              <mat-icon>devices</mat-icon>
              <span>Fully Responsive</span>
            </div>
            <div class="stat-item">
              <mat-icon>speed</mat-icon>
              <span>Optimized Performance</span>
            </div>
          </div>
          <p class="footer-text">
            🎉 All creative features implemented with default images and modern design!
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .showcase-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .showcase-header {
      margin-bottom: 3rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .showcase-avatar {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);

      mat-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
      }
    }

    .showcase-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: white;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 1rem;

      .title-icon {
        color: #FFD700;
        font-size: 2.5rem;
        animation: sparkle 2s ease-in-out infinite;
      }
    }

    .showcase-subtitle {
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
    }

    .showcase-section {
      margin-bottom: 4rem;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 600;
      color: white;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

      mat-icon {
        color: #FFD700;
        font-size: 2rem;
      }
    }

    .facilities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        background: rgba(255, 255, 255, 0.15);
      }
    }

    .feature-icon-container {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .feature-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
      box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
    }

    .feature-card h3 {
      color: white;
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0 0 1rem 0;
      text-align: center;
    }

    .feature-card p {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .feature-demo {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    .demo-image {
      width: 80px;
      height: 60px;
      object-fit: cover;
      border-radius: 12px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    .glass-demo {
      display: flex;
      justify-content: center;
    }

    .glass-element {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      padding: 1rem 2rem;
      color: white;
      font-weight: 500;
    }

    .animation-demo {
      display: flex;
      justify-content: center;
    }

    .floating-element {
      color: #FF6B6B;
      animation: float 3s ease-in-out infinite;

      mat-icon {
        font-size: 2rem;
      }
    }

    .gradient-demo {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
    }

    .gradient-sample {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);

      &.gradient-1 {
        background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
      }

      &.gradient-2 {
        background: linear-gradient(135deg, #2196F3 0%, #64B5F6 100%);
      }

      &.gradient-3 {
        background: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%);
      }
    }

    .showcase-footer {
      margin-top: 4rem;
    }

    .footer-content {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      text-align: center;
    }

    .footer-stats {
      display: flex;
      justify-content: center;
      gap: 3rem;
      margin-bottom: 1.5rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: white;
      font-weight: 500;

      mat-icon {
        color: #4CAF50;
      }
    }

    .footer-text {
      font-size: 1.2rem;
      color: white;
      margin: 0;
      font-weight: 500;
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .showcase-stats,
    .showcase-actions {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    @keyframes sparkle {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.1) rotate(180deg); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
    }

    @media (max-width: 768px) {
      .showcase-container {
        padding: 1rem;
      }

      .header-content {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
      }

      .header-left {
        flex-direction: column;
        gap: 1rem;
      }

      .showcase-title {
        font-size: 2rem;
        flex-direction: column;
        gap: 0.5rem;
      }

      .facilities-grid,
      .features-grid {
        grid-template-columns: 1fr;
      }

      .footer-stats {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class DashboardShowcaseComponent implements OnInit {
  showcaseFacilities: ImageCardData[] = [];

  constructor(public imageService: ImageService) {}

  ngOnInit(): void {
    this.loadShowcaseFacilities();
    this.imageService.preloadImages();
  }

  private loadShowcaseFacilities(): void {
    this.showcaseFacilities = [
      {
        id: 'showcase-sanatorium',
        title: 'Premium Health Resort',
        subtitle: 'Luxury Medical Care',
        description: 'Experience world-class medical treatments in a luxurious setting with our default sanatorium image.',
        imageUrl: this.imageService.getDefaultImage('sanatoriums'),
        type: 'sanatoriums',
        rating: 4.9,
        price: 200,
        location: 'Tashkent, Uzbekistan',
        features: ['Medical', 'Spa', 'WiFi', 'Restaurant', 'Pool'],
        status: 'active',
        badge: {
          text: 'Featured',
          color: '#4CAF50'
        },
        actions: {
          primary: { label: 'Book Now', action: 'book' },
          secondary: { label: 'View Details', action: 'view' }
        }
      },
      {
        id: 'showcase-camp',
        title: 'Adventure Kids Paradise',
        subtitle: 'Ultimate Summer Experience',
        description: 'Fun-filled activities and adventures for children with our beautiful default camp image.',
        imageUrl: this.imageService.getDefaultImage('camps'),
        type: 'camps',
        rating: 4.8,
        price: 120,
        location: 'Chimgan Mountains',
        features: ['Activities', 'Nature', 'Kids Club', 'Transport', 'Beach'],
        status: 'active',
        badge: {
          text: 'Popular',
          color: '#FF9800'
        },
        actions: {
          primary: { label: 'Book Now', action: 'book' },
          secondary: { label: 'View Details', action: 'view' }
        }
      }
    ];
  }

  handleFacilityClick(facility: ImageCardData): void {
    console.log('Showcase facility clicked:', facility.title);
  }

  handleFacilityAction(event: {action: string, data: ImageCardData}): void {
    console.log('Showcase facility action:', event.action, 'for', event.data.title);
  }

  handleActionClick(action: any): void {
    console.log('Showcase action clicked:', action);
  }

  trackByFacility(index: number, facility: ImageCardData): string {
    return facility.id;
  }
}