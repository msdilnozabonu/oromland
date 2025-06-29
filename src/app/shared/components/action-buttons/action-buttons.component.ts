import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';

interface ActionButton {
  id: string;
  label: string;
  icon: string;
  color: string;
  gradient: string;
  description?: string;
  disabled?: boolean;
  badge?: number;
  shortcut?: string;
}

@Component({
  selector: 'app-action-buttons',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatRippleModule
  ],
  template: `
    <div class="action-buttons-container">
      <!-- Quick Actions Floating Button -->
      <div class="quick-actions-fab" *ngIf="showQuickActions">
        <button mat-fab 
                class="main-fab"
                [matMenuTriggerFor]="quickMenu"
                matTooltip="Quick Actions"
                matTooltipPosition="left">
          <mat-icon>add</mat-icon>
        </button>

        <mat-menu #quickMenu="matMenu" class="quick-actions-menu">
          <div class="menu-header">
            <mat-icon>flash_on</mat-icon>
            <h3>Quick Actions</h3>
          </div>
          <div class="menu-actions">
            <button *ngFor="let action of quickActions" 
                    mat-menu-item 
                    class="quick-action-item"
                    [disabled]="action.disabled"
                    (click)="handleActionClick(action)">
              <div class="action-icon" [style.background]="action.gradient">
                <mat-icon>{{action.icon}}</mat-icon>
              </div>
              <div class="action-content">
                <span class="action-label">{{action.label}}</span>
                <span class="action-description" *ngIf="action.description">{{action.description}}</span>
              </div>
              <div class="action-shortcut" *ngIf="action.shortcut">{{action.shortcut}}</div>
            </button>
          </div>
        </mat-menu>
      </div>

      <!-- Action Grid -->
      <div class="actions-grid" *ngIf="actions.length > 0">
        <div *ngFor="let action of actions; trackBy: trackByAction" 
             class="action-card"
             [class]="'action-' + action.id"
             matRipple
             [matRippleColor]="action.color + '20'"
             (click)="handleActionClick(action)"
             [matTooltip]="action.description || action.label"
             matTooltipPosition="above">
          
          <div class="action-background">
            <div class="background-shape" [style.background]="action.gradient"></div>
            <div class="background-particles">
              <div class="particle" *ngFor="let i of [1,2,3,4,5]"></div>
            </div>
          </div>

          <div class="action-content">
            <div class="action-header">
              <div class="action-icon-container" [style.background]="action.gradient">
                <mat-icon class="action-icon">{{action.icon}}</mat-icon>
                <div class="icon-glow" [style.box-shadow]="'0 0 20px ' + action.color + '40'"></div>
              </div>
              <div class="action-badge" *ngIf="action.badge && action.badge > 0">
                {{action.badge}}
              </div>
            </div>

            <div class="action-body">
              <h3 class="action-title">{{action.label}}</h3>
              <p class="action-description" *ngIf="action.description">{{action.description}}</p>
            </div>

            <div class="action-footer">
              <div class="action-shortcut" *ngIf="action.shortcut">
                <kbd>{{action.shortcut}}</kbd>
              </div>
              <mat-icon class="action-arrow">arrow_forward</mat-icon>
            </div>
          </div>

          <div class="action-hover-effect">
            <div class="hover-glow" [style.background]="action.gradient"></div>
          </div>
        </div>
      </div>

      <!-- Floating Action Buttons -->
      <div class="floating-actions" *ngIf="floatingActions.length > 0">
        <div *ngFor="let action of floatingActions; let i = index" 
             class="floating-action"
             [style.bottom.px]="80 + (i * 70)"
             [style.right.px]="20">
          <button mat-fab 
                  [color]="getMatColor(action.color)"
                  [style.background]="action.gradient"
                  [matTooltip]="action.label"
                  matTooltipPosition="left"
                  [disabled]="action.disabled"
                  (click)="handleActionClick(action)">
            <mat-icon>{{action.icon}}</mat-icon>
            <div class="fab-badge" *ngIf="action.badge && action.badge > 0">{{action.badge}}</div>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .action-buttons-container {
      position: relative;
      width: 100%;
    }

    /* Quick Actions FAB */
    .quick-actions-fab {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }

    .main-fab {
      background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
      color: white;
      box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: scale(1.1) rotate(90deg);
        box-shadow: 0 12px 35px rgba(76, 175, 80, 0.6);
      }
    }

    ::ng-deep .quick-actions-menu {
      .mat-mdc-menu-panel {
        width: 320px;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
    }

    .menu-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem 1.5rem 1rem 1.5rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);

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
    }

    .menu-actions {
      padding: 0.5rem 0;
    }

    .quick-action-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      height: auto;
      min-height: 60px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(76, 175, 80, 0.05);
        transform: translateX(4px);

        .action-icon {
          transform: scale(1.1);
        }
      }

      .action-icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        transition: transform 0.3s ease;

        mat-icon {
          font-size: 1.2rem;
        }
      }

      .action-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .action-label {
          font-weight: 500;
          color: #2d3748;
          margin-bottom: 0.25rem;
        }

        .action-description {
          font-size: 0.8rem;
          color: #6b7280;
        }
      }

      .action-shortcut {
        font-size: 0.75rem;
        color: #9E9E9E;
        background: #f5f5f5;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
      }
    }

    /* Action Grid */
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .action-card {
      position: relative;
      background: white;
      border-radius: 20px;
      padding: 2rem;
      cursor: pointer;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

        .action-icon-container {
          transform: scale(1.1) rotate(5deg);
        }

        .background-particles .particle {
          animation: particleFloat 3s ease-in-out infinite;
        }

        .hover-glow {
          opacity: 0.1;
          transform: scale(1.5);
        }

        .action-arrow {
          transform: translateX(5px);
        }
      }
    }

    .action-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;
    }

    .background-shape {
      position: absolute;
      top: -50px;
      right: -50px;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      opacity: 0.1;
      filter: blur(20px);
    }

    .background-particles {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;

      .particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(76, 175, 80, 0.3);
        border-radius: 50%;

        &:nth-child(1) { top: 20%; left: 15%; }
        &:nth-child(2) { top: 40%; right: 20%; }
        &:nth-child(3) { bottom: 30%; left: 25%; }
        &:nth-child(4) { top: 60%; left: 60%; }
        &:nth-child(5) { bottom: 20%; right: 15%; }
      }
    }

    .action-content {
      position: relative;
      z-index: 2;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .action-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .action-icon-container {
      position: relative;
      width: 70px;
      height: 70px;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

      .action-icon {
        font-size: 2rem;
        color: white;
        z-index: 2;
      }

      .icon-glow {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 18px;
        transition: all 0.3s ease;
      }
    }

    .action-badge {
      background: #F44336;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(244, 67, 54, 0.4);
    }

    .action-body {
      flex: 1;
      margin-bottom: 1rem;
    }

    .action-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
    }

    .action-description {
      font-size: 0.95rem;
      color: #6b7280;
      line-height: 1.5;
      margin: 0;
    }

    .action-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .action-shortcut {
      kbd {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        color: #6b7280;
      }
    }

    .action-arrow {
      color: #9E9E9E;
      transition: transform 0.3s ease;
    }

    .action-hover-effect {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;
      pointer-events: none;

      .hover-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
        transition: all 0.4s ease;
        filter: blur(30px);
      }
    }

    /* Floating Actions */
    .floating-actions {
      position: fixed;
      z-index: 999;
    }

    .floating-action {
      position: absolute;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      button {
        position: relative;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);

        &:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
      }

      .fab-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #F44336;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        font-weight: 600;
        border: 2px solid white;
      }
    }

    @keyframes particleFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    @media (max-width: 768px) {
      .actions-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .action-card {
        padding: 1.5rem;
      }

      .action-icon-container {
        width: 60px;
        height: 60px;

        .action-icon {
          font-size: 1.5rem;
        }
      }

      .quick-actions-fab {
        bottom: 80px;
      }

      .floating-actions {
        display: none;
      }
    }
  `]
})
export class ActionButtonsComponent {
  @Input() actions: ActionButton[] = [];
  @Input() quickActions: ActionButton[] = [];
  @Input() floatingActions: ActionButton[] = [];
  @Input() showQuickActions = true;
  @Input() type: 'admin' | 'manager' | 'user' | 'operator' = 'admin';

  @Output() actionClick = new EventEmitter<ActionButton>();

  ngOnInit(): void {
    if (this.actions.length === 0) {
      this.loadDefaultActions();
    }
  }

  private loadDefaultActions(): void {
    switch (this.type) {
      case 'admin':
        this.actions = [
          {
            id: 'add-camp',
            label: 'Add New Camp',
            icon: 'add_location',
            color: '#4CAF50',
            gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
            description: 'Create a new camping facility',
            shortcut: 'Ctrl+N'
          },
          {
            id: 'add-sanatorium',
            label: 'Add Sanatorium',
            icon: 'local_hospital',
            color: '#2196F3',
            gradient: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
            description: 'Register a new health center',
            shortcut: 'Ctrl+H'
          },
          {
            id: 'manage-users',
            label: 'User Management',
            icon: 'manage_accounts',
            color: '#FF9800',
            gradient: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
            description: 'Manage user accounts and permissions',
            badge: 5
          },
          {
            id: 'analytics',
            label: 'Analytics & Reports',
            icon: 'analytics',
            color: '#9C27B0',
            gradient: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
            description: 'View detailed reports and insights'
          }
        ];

        this.quickActions = [
          {
            id: 'quick-camp',
            label: 'Quick Add Camp',
            icon: 'add_location',
            color: '#4CAF50',
            gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
            description: 'Fast camp creation',
            shortcut: 'Ctrl+Q'
          },
          {
            id: 'approve-all',
            label: 'Approve Pending',
            icon: 'done_all',
            color: '#2196F3',
            gradient: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
            description: 'Bulk approve items',
            badge: 15
          }
        ];
        break;

      case 'manager':
        this.actions = [
          {
            id: 'approve-docs',
            label: 'Approve Documents',
            icon: 'fact_check',
            color: '#F44336',
            gradient: 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)',
            description: 'Review and approve pending documents',
            badge: 7
          },
          {
            id: 'manage-bookings',
            label: 'Manage Bookings',
            icon: 'calendar_month',
            color: '#4CAF50',
            gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
            description: 'Handle reservations and check-ins'
          }
        ];
        break;
    }
  }

  handleActionClick(action: ActionButton): void {
    if (!action.disabled) {
      this.actionClick.emit(action);
      console.log('Action clicked:', action.id);
    }
  }

  trackByAction(index: number, action: ActionButton): string {
    return action.id;
  }

  getMatColor(color: string): string {
    if (color === '#4CAF50') return 'primary';
    if (color === '#2196F3') return 'accent';
    if (color === '#F44336') return 'warn';
    return 'primary';
  }
}