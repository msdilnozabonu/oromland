import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule, 
    MatBadgeModule, 
    MatDialogModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  template: `
    <div class="overview-container">
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <div class="manager-avatar">
              <mat-icon>account_circle</mat-icon>
            </div>
            <div>
              <h1 class="page-title">
                <mat-icon class="title-icon">manage_accounts</mat-icon>
                Manager Dashboard
              </h1>
              <p class="page-subtitle">Welcome back, {{managerName}}! Manage your assigned facilities</p>
              <div class="manager-badges">
                <mat-chip-set>
                  <mat-chip *ngFor="let facility of assignedFacilities" [color]="facility.type === 'camp' ? 'primary' : 'accent'">
                    <mat-icon>{{facility.type === 'camp' ? 'nature_people' : 'local_hospital'}}</mat-icon>
                    {{facility.name}}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="openQuickActions()" class="quick-action-btn">
              <mat-icon>dashboard_customize</mat-icon>
              Quick Actions
            </button>
          </div>
        </div>
      </div>

      <div class="performance-overview">
        <h2 class="section-title">
          <mat-icon>trending_up</mat-icon>
          Performance Overview
        </h2>
        <div class="performance-grid">
          <div class="performance-card revenue">
            <div class="performance-header">
              <div class="performance-icon">
                <mat-icon>attach_money</mat-icon>
              </div>
              <div class="performance-trend positive">
                <mat-icon>trending_up</mat-icon>
                +15.3%
              </div>
            </div>
            <div class="performance-content">
              <div class="performance-value">\${{monthlyRevenue | number}}</div>
              <div class="performance-label">Monthly Revenue</div>
              <mat-progress-bar mode="determinate" [value]="revenueProgress" color="primary"></mat-progress-bar>
            </div>
          </div>

          <div class="performance-card bookings">
            <div class="performance-header">
              <div class="performance-icon">
                <mat-icon>event_available</mat-icon>
              </div>
              <div class="performance-trend positive">
                <mat-icon>trending_up</mat-icon>
                +8.7%
              </div>
            </div>
            <div class="performance-content">
              <div class="performance-value">{{totalBookings}}</div>
              <div class="performance-label">Total Bookings</div>
              <mat-progress-bar mode="determinate" [value]="bookingProgress" color="accent"></mat-progress-bar>
            </div>
          </div>

          <div class="performance-card satisfaction">
            <div class="performance-header">
              <div class="performance-icon">
                <mat-icon>sentiment_very_satisfied</mat-icon>
              </div>
              <div class="performance-trend positive">
                <mat-icon>trending_up</mat-icon>
                +2.1%
              </div>
            </div>
            <div class="performance-content">
              <div class="performance-value">{{satisfactionScore}}/5</div>
              <div class="performance-label">Satisfaction Score</div>
              <mat-progress-bar mode="determinate" [value]="satisfactionProgress" color="warn"></mat-progress-bar>
            </div>
          </div>

          <div class="performance-card occupancy">
            <div class="performance-header">
              <div class="performance-icon">
                <mat-icon>hotel</mat-icon>
              </div>
              <div class="performance-trend neutral">
                <mat-icon>trending_flat</mat-icon>
                -1.2%
              </div>
            </div>
            <div class="performance-content">
              <div class="performance-value">{{occupancyRate}}%</div>
              <div class="performance-label">Occupancy Rate</div>
              <mat-progress-bar mode="determinate" [value]="occupancyRate" color="primary"></mat-progress-bar>
            </div>
          </div>
        </div>
      </div>

      <div class="management-section">
        <h2 class="section-title">
          <mat-icon>business_center</mat-icon>
          Management Center
        </h2>
        
        <div class="management-grid">
          <mat-card class="management-card facilities" (click)="manageFacilities()">
            <mat-card-content>
              <div class="management-header">
                <div class="management-icon">
                  <mat-icon>domain</mat-icon>
                </div>
                <div class="management-badge">
                  <mat-icon>verified</mat-icon>
                  {{assignedFacilities.length}} Assigned
                </div>
              </div>
              <h3>My Facilities</h3>
              <p>Manage your assigned camps and sanatoriums</p>
              <div class="facility-preview">
                <div *ngFor="let facility of assignedFacilities.slice(0, 3)" class="facility-chip">
                  <mat-icon>{{facility.type === 'camp' ? 'nature_people' : 'local_hospital'}}</mat-icon>
                  {{facility.name}}
                </div>
              </div>
              <div class="card-actions">
                <button mat-raised-button color="primary">
                  <mat-icon>settings</mat-icon>
                  Manage All
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="management-card approvals" (click)="viewApprovals()">
            <mat-card-content>
              <div class="management-header">
                <div class="management-icon urgent">
                  <mat-icon>pending_actions</mat-icon>
                </div>
                <div class="management-badge urgent" *ngIf="pendingApprovals > 0">
                  <mat-icon>priority_high</mat-icon>
                  {{pendingApprovals}} Pending
                </div>
              </div>
              <h3>Document Approvals</h3>
              <p>Review and approve pending documents</p>
              <div class="approval-types">
                <div class="approval-type">
                  <mat-icon>description</mat-icon>
                  <span>{{pendingDocuments}} Documents</span>
                </div>
                <div class="approval-type">
                  <mat-icon>photo</mat-icon>
                  <span>{{pendingImages}} Images</span>
                </div>
                <div class="approval-type">
                  <mat-icon>video_library</mat-icon>
                  <span>{{pendingVideos}} Videos</span>
                </div>
              </div>
              <div class="card-actions">
                <button mat-raised-button color="warn">
                  <mat-icon>fact_check</mat-icon>
                  Review Now
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="management-card bookings" (click)="manageBookings()">
            <mat-card-content>
              <div class="management-header">
                <div class="management-icon">
                  <mat-icon>calendar_month</mat-icon>
                </div>
                <div class="management-badge">
                  <mat-icon>schedule</mat-icon>
                  {{todayBookings}} Today
                </div>
              </div>
              <h3>Booking Management</h3>
              <p>Handle reservations and check-ins</p>
              <div class="booking-stats">
                <div class="booking-stat">
                  <span class="stat-number">{{upcomingCheckIns}}</span>
                  <span class="stat-label">Check-ins</span>
                </div>
                <div class="booking-stat">
                  <span class="stat-number">{{upcomingCheckOuts}}</span>
                  <span class="stat-label">Check-outs</span>
                </div>
              </div>
              <div class="card-actions">
                <button mat-raised-button color="accent">
                  <mat-icon>event_note</mat-icon>
                  View Calendar
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="management-card reports" (click)="viewReports()">
            <mat-card-content>
              <div class="management-header">
                <div class="management-icon">
                  <mat-icon>analytics</mat-icon>
                </div>
                <div class="management-badge">
                  <mat-icon>update</mat-icon>
                  Updated
                </div>
              </div>
              <h3>Reports & Analytics</h3>
              <p>View performance metrics and insights</p>
              <div class="report-preview">
                <div class="mini-chart">
                  <div class="chart-bar" style="height: 60%"></div>
                  <div class="chart-bar" style="height: 80%"></div>
                  <div class="chart-bar" style="height: 45%"></div>
                  <div class="chart-bar" style="height: 90%"></div>
                  <div class="chart-bar" style="height: 70%"></div>
                </div>
              </div>
              <div class="card-actions">
                <button mat-raised-button>
                  <mat-icon>bar_chart</mat-icon>
                  View Reports
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overview-container {
      padding: 2rem;
      background: #f8fffe;
      min-height: 100vh;
    }

    .page-header {
      margin-bottom: 3rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .header-left {
      display: flex;
      align-items: flex-start;
      gap: 1.5rem;
    }

    .manager-avatar {
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

    .page-title {
      font-size: 2.2rem;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .title-icon {
        color: #4CAF50;
        font-size: 2rem;
      }
    }

    .page-subtitle {
      font-size: 1.1rem;
      color: #6b7280;
      margin: 0 0 1rem 0;
    }

    .manager-badges {
      margin-top: 1rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .quick-action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 15px rgba(76, 175, 80, 0.08);
      border: 1px solid #e8f5e8;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(76, 175, 80, 0.15);
      }
    }

    .stat-icon {
      background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
      color: white;
      width: 60px;
      height: 60px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 1.5rem;
      }
    }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #6b7280;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      mat-icon {
        color: #4CAF50;
      }
    }

    .performance-overview {
      margin-bottom: 3rem;
    }

    .performance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }

    .performance-card {
      background: white;
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
      border: 1px solid #f0f0f0;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
      }

      &.revenue {
        border-left: 4px solid #4CAF50;
      }

      &.bookings {
        border-left: 4px solid #2196F3;
      }

      &.satisfaction {
        border-left: 4px solid #FF9800;
      }

      &.occupancy {
        border-left: 4px solid #9C27B0;
      }
    }

    .performance-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .performance-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;

      mat-icon {
        font-size: 1.5rem;
      }
    }

    .performance-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 20px;

      &.positive {
        background: rgba(76, 175, 80, 0.1);
        color: #4CAF50;
      }

      &.neutral {
        background: rgba(158, 158, 158, 0.1);
        color: #9E9E9E;
      }

      mat-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }
    }

    .performance-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 0.5rem;
    }

    .performance-label {
      font-size: 0.9rem;
      color: #6b7280;
      margin-bottom: 1rem;
    }

    .management-section {
      margin-bottom: 3rem;
    }

    .management-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
    }

    .management-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 16px;
      overflow: hidden;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
      }

      mat-card-content {
        padding: 2rem;
      }

      h3 {
        margin: 1rem 0 0.5rem 0;
        color: #2d3748;
        font-weight: 600;
        font-size: 1.2rem;
      }

      p {
        color: #6b7280;
        margin-bottom: 1.5rem;
        line-height: 1.5;
      }
    }

    .management-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .management-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
      color: white;

      &.urgent {
        background: linear-gradient(135deg, #F44336 0%, #EF5350 100%);
        animation: pulse 2s infinite;
      }

      mat-icon {
        font-size: 1.5rem;
      }
    }

    .management-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: rgba(76, 175, 80, 0.1);
      color: #4CAF50;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;

      &.urgent {
        background: rgba(244, 67, 54, 0.1);
        color: #F44336;
      }

      mat-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }
    }

    .facility-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .facility-chip {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: #f8f9fa;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      color: #6b7280;

      mat-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }
    }

    .approval-types {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .approval-type {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #6b7280;

      mat-icon {
        font-size: 1.2rem;
        width: 1.2rem;
        height: 1.2rem;
        color: #9E9E9E;
      }
    }

    .booking-stats {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
    }

    .booking-stat {
      display: flex;
      flex-direction: column;
      align-items: center;

      .stat-number {
        font-size: 1.5rem;
        font-weight: 700;
        color: #2d3748;
      }

      .stat-label {
        font-size: 0.8rem;
        color: #6b7280;
      }
    }

    .report-preview {
      margin-bottom: 1.5rem;
    }

    .mini-chart {
      display: flex;
      align-items: end;
      gap: 0.25rem;
      height: 40px;
    }

    .chart-bar {
      width: 8px;
      background: linear-gradient(to top, #4CAF50, #66BB6A);
      border-radius: 4px;
      transition: all 0.3s ease;

      &:hover {
        background: linear-gradient(to top, #388E3C, #4CAF50);
      }
    }

    .card-actions {
      margin-top: 1rem;
    }

    .action-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid #e8f5e8;
      box-shadow: 0 4px 15px rgba(76, 175, 80, 0.08);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(76, 175, 80, 0.15);
        border-color: #4CAF50;

        .action-icon {
          background: #4CAF50;
          transform: scale(1.1);
        }
      }
    }

    .action-icon {
      background: #f0fdf4;
      color: #4CAF50;
      width: 60px;
      height: 60px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;

      i {
        font-size: 1.5rem;
      }
    }

    .action-content {
      flex: 1;

      h4 {
        font-size: 1.1rem;
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 0.25rem;
      }

      p {
        font-size: 0.9rem;
        color: #6b7280;
        margin: 0;
      }
    }

    @media (max-width: 768px) {
      .overview-container {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OverviewComponent implements OnInit, OnDestroy {
  managerName = 'Sarah Johnson';
  
  assignedFacilities = [
    { id: 1, name: 'Charvak Lake Camp', type: 'camp' },
    { id: 2, name: 'Wellness Sanatorium', type: 'sanatorium' },
    { id: 3, name: 'Mountain Resort', type: 'camp' }
  ];

  monthlyRevenue = 45750;
  revenueProgress = 78;
  totalBookings = 156;
  bookingProgress = 65;
  satisfactionScore = 4.7;
  satisfactionProgress = 94;
  occupancyRate = 82;

  pendingApprovals = 7;
  pendingDocuments = 12;
  pendingImages = 8;
  pendingVideos = 3;
  todayBookings = 5;
  upcomingCheckIns = 8;
  upcomingCheckOuts = 12;

  private subscriptions = new Subscription();

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadStatistics(): void {
    // Load manager statistics from backend
  }

  openQuickActions(): void {
    console.log('Opening quick actions menu');
  }

  manageFacilities(): void {
    console.log('Navigate to facilities management');
  }

  viewApprovals(): void {
    console.log('Navigate to document approvals');
  }

  manageBookings(): void {
    console.log('Navigate to booking management');
  }

  viewReports(): void {
    console.log('Navigate to reports and analytics');
  }
}