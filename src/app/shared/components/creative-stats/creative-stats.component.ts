import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';

interface StatCard {
  id: string;
  title: string;
  value: number | string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  progress?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

@Component({
  selector: 'app-creative-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatRippleModule
  ],
  template: `
    <div class="creative-stats-container">
      <div class="stats-grid">
        <div *ngFor="let stat of stats; trackBy: trackByStat" 
             class="stat-card"
             [class]="'stat-' + stat.id"
             matRipple
             [matRippleColor]="getRippleColor(stat.color)"
             (click)="handleStatClick(stat)">
          
          <div class="stat-background">
            <div class="background-pattern"></div>
            <div class="background-glow" [style.background]="getGlowColor(stat.color)"></div>
          </div>

          <div class="stat-content">
            <div class="stat-header">
              <div class="stat-icon-container" [style.background]="getIconBackground(stat.color)">
                <mat-icon class="stat-icon">{{stat.icon}}</mat-icon>
                <div class="icon-pulse" [style.background]="stat.color"></div>
              </div>
              
              <div class="stat-trend" *ngIf="stat.trend" [class]="'trend-' + stat.trend.direction">
                <mat-icon>{{getTrendIcon(stat.trend.direction)}}</mat-icon>
                <span>{{stat.trend.value > 0 ? '+' : ''}}{{stat.trend.value}}%</span>
              </div>
            </div>

            <div class="stat-body">
              <div class="stat-value" [style.color]="stat.color">
                {{formatValue(stat.value)}}
                <div class="value-animation"></div>
              </div>
              <div class="stat-title">{{stat.title}}</div>
              <div class="stat-subtitle" *ngIf="stat.trend">{{stat.trend.label}}</div>
            </div>

            <div class="stat-progress" *ngIf="stat.progress !== undefined">
              <mat-progress-bar 
                mode="determinate" 
                [value]="stat.progress"
                [color]="getProgressColor(stat.color)">
              </mat-progress-bar>
              <div class="progress-label">{{stat.progress}}% of target</div>
            </div>

            <div class="stat-footer" *ngIf="stat.action">
              <button mat-button 
                      class="stat-action-btn"
                      [style.color]="stat.color"
                      (click)="handleActionClick(stat, $event)">
                <mat-icon>{{getActionIcon(stat.id)}}</mat-icon>
                {{stat.action.label}}
              </button>
            </div>
          </div>

          <div class="stat-decorations">
            <div class="decoration decoration-1" [style.background]="stat.color"></div>
            <div class="decoration decoration-2" [style.background]="stat.color"></div>
            <div class="decoration decoration-3" [style.background]="stat.color"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .creative-stats-container {
      width: 100%;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .stat-card {
      position: relative;
      background: white;
      border-radius: 24px;
      padding: 2rem;
      cursor: pointer;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(10px);

      &:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

        .stat-icon-container {
          transform: scale(1.1) rotate(5deg);
        }

        .background-glow {
          opacity: 0.3;
          transform: scale(1.2);
        }

        .decoration {
          animation: float 3s ease-in-out infinite;
        }

        .value-animation {
          animation: valueGlow 2s ease-in-out infinite;
        }
      }

      &.stat-revenue {
        border-left: 6px solid #4CAF50;
      }

      &.stat-bookings {
        border-left: 6px solid #2196F3;
      }

      &.stat-users {
        border-left: 6px solid #FF9800;
      }

      &.stat-satisfaction {
        border-left: 6px solid #9C27B0;
      }

      &.stat-camps {
        border-left: 6px solid #4CAF50;
      }

      &.stat-sanatoriums {
        border-left: 6px solid #2196F3;
      }

      &.stat-approvals {
        border-left: 6px solid #F44336;
      }
    }

    .stat-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;
    }

    .background-pattern {
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
      background-size: 20px 20px;
      animation: patternMove 20s linear infinite;
    }

    .background-glow {
      position: absolute;
      top: -20px;
      right: -20px;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      opacity: 0.1;
      transition: all 0.4s ease;
      filter: blur(20px);
    }

    .stat-content {
      position: relative;
      z-index: 2;
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .stat-icon-container {
      position: relative;
      width: 70px;
      height: 70px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

      .stat-icon {
        font-size: 2rem;
        color: white;
        z-index: 2;
      }

      .icon-pulse {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        border-radius: 20px;
        transform: translate(-50%, -50%);
        opacity: 0.3;
        animation: iconPulse 3s ease-in-out infinite;
      }
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      backdrop-filter: blur(10px);

      &.trend-up {
        background: rgba(76, 175, 80, 0.15);
        color: #4CAF50;
        border: 1px solid rgba(76, 175, 80, 0.3);
      }

      &.trend-down {
        background: rgba(244, 67, 54, 0.15);
        color: #F44336;
        border: 1px solid rgba(244, 67, 54, 0.3);
      }

      &.trend-neutral {
        background: rgba(158, 158, 158, 0.15);
        color: #9E9E9E;
        border: 1px solid rgba(158, 158, 158, 0.3);
      }

      mat-icon {
        font-size: 1.2rem;
        width: 1.2rem;
        height: 1.2rem;
      }
    }

    .stat-body {
      margin-bottom: 1.5rem;
    }

    .stat-value {
      position: relative;
      font-size: 3rem;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, currentColor 0%, currentColor 100%);
      -webkit-background-clip: text;
      background-clip: text;

      .value-animation {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        transform: translateX(-100%);
      }
    }

    .stat-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 0.25rem;
    }

    .stat-subtitle {
      font-size: 0.9rem;
      color: #6b7280;
    }

    .stat-progress {
      margin-bottom: 1rem;

      mat-progress-bar {
        height: 8px;
        border-radius: 4px;
        overflow: hidden;
      }

      .progress-label {
        font-size: 0.8rem;
        color: #6b7280;
        margin-top: 0.5rem;
        text-align: right;
      }
    }

    .stat-footer {
      display: flex;
      justify-content: flex-end;
    }

    .stat-action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
        transform: scale(1.05);
      }

      mat-icon {
        font-size: 1.2rem;
      }
    }

    .stat-decorations {
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
        top: 60%;
        right: 25%;
        animation-delay: 1s;
      }

      &.decoration-3 {
        width: 8px;
        height: 8px;
        top: 80%;
        right: 10%;
        animation-delay: 2s;
      }
    }

    @keyframes patternMove {
      0% { transform: translate(0, 0); }
      100% { transform: translate(20px, 20px); }
    }

    @keyframes iconPulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
      50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.5; }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    @keyframes valueGlow {
      0%, 100% { transform: translateX(-100%); }
      50% { transform: translateX(100%); }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .stat-card {
        padding: 1.5rem;
      }

      .stat-value {
        font-size: 2.5rem;
      }

      .stat-icon-container {
        width: 60px;
        height: 60px;

        .stat-icon {
          font-size: 1.5rem;
        }
      }
    }
  `]
})
export class CreativeStatsComponent implements OnInit {
  @Input() stats: StatCard[] = [];
  @Input() type: 'admin' | 'manager' | 'user' | 'operator' = 'admin';

  ngOnInit(): void {
    if (this.stats.length === 0) {
      this.loadDefaultStats();
    }
  }

  private loadDefaultStats(): void {
    switch (this.type) {
      case 'admin':
        this.stats = [
          {
            id: 'camps',
            title: 'Managed Camps',
            value: 12,
            icon: 'nature_people',
            color: '#4CAF50',
            trend: { value: 12, direction: 'up', label: 'New this month' },
            progress: 75,
            action: { label: 'Manage', callback: () => console.log('Manage camps') }
          },
          {
            id: 'sanatoriums',
            title: 'Sanatoriums',
            value: 8,
            icon: 'local_hospital',
            color: '#2196F3',
            trend: { value: 8, direction: 'up', label: 'Active facilities' },
            progress: 60,
            action: { label: 'View All', callback: () => console.log('View sanatoriums') }
          },
          {
            id: 'users',
            title: 'Active Users',
            value: 456,
            icon: 'people',
            color: '#FF9800',
            trend: { value: 23, direction: 'up', label: 'This week' },
            progress: 85,
            action: { label: 'Manage', callback: () => console.log('Manage users') }
          },
          {
            id: 'approvals',
            title: 'Pending Approvals',
            value: 15,
            icon: 'pending_actions',
            color: '#F44336',
            trend: { value: -5, direction: 'down', label: 'Urgent items' },
            progress: 30,
            action: { label: 'Review', callback: () => console.log('Review approvals') }
          }
        ];
        break;
      case 'manager':
        this.stats = [
          {
            id: 'revenue',
            title: 'Monthly Revenue',
            value: '$45,750',
            icon: 'attach_money',
            color: '#4CAF50',
            trend: { value: 15.3, direction: 'up', label: 'vs last month' },
            progress: 78
          },
          {
            id: 'bookings',
            title: 'Total Bookings',
            value: 156,
            icon: 'event_available',
            color: '#2196F3',
            trend: { value: 8.7, direction: 'up', label: 'This month' },
            progress: 65
          },
          {
            id: 'satisfaction',
            title: 'Satisfaction Score',
            value: '4.7/5',
            icon: 'sentiment_very_satisfied',
            color: '#9C27B0',
            trend: { value: 2.1, direction: 'up', label: 'Customer rating' },
            progress: 94
          }
        ];
        break;
    }
  }

  handleStatClick(stat: StatCard): void {
    console.log('Stat clicked:', stat.id);
  }

  handleActionClick(stat: StatCard, event: Event): void {
    event.stopPropagation();
    if (stat.action) {
      stat.action.callback();
    }
  }

  trackByStat(index: number, stat: StatCard): string {
    return stat.id;
  }

  formatValue(value: number | string): string {
    if (typeof value === 'number' && value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }

  getTrendIcon(direction: string): string {
    const icons = {
      up: 'trending_up',
      down: 'trending_down',
      neutral: 'trending_flat'
    };
    return icons[direction as keyof typeof icons] || 'trending_flat';
  }

  getIconBackground(color: string): string {
    return `linear-gradient(135deg, ${color} 0%, ${this.lightenColor(color, 20)} 100%)`;
  }

  getGlowColor(color: string): string {
    return `radial-gradient(circle, ${color}40 0%, transparent 70%)`;
  }

  getRippleColor(color: string): string {
    return `${color}20`;
  }

  getProgressColor(color: string): string {
    if (color === '#4CAF50') return 'primary';
    if (color === '#2196F3') return 'accent';
    if (color === '#F44336') return 'warn';
    return 'primary';
  }

  getActionIcon(statId: string): string {
    const icons = {
      camps: 'settings',
      sanatoriums: 'visibility',
      users: 'manage_accounts',
      approvals: 'fact_check',
      revenue: 'analytics',
      bookings: 'calendar_view_month',
      satisfaction: 'star'
    };
    return icons[statId as keyof typeof icons] || 'arrow_forward';
  }

  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }
}