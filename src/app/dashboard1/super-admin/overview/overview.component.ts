import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="overview-container">
      <div class="page-header">
        <h1 class="page-title">Super Admin Overview</h1>
        <p class="page-subtitle">Complete system management and oversight</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="material-icons">nature_people</i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{totalCamps}}</div>
            <div class="stat-label">Total Camps</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="material-icons">local_hospital</i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{totalSanatoriums}}</div>
            <div class="stat-label">Total Sanatoriums</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="material-icons">people</i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{totalUsers}}</div>
            <div class="stat-label">Total Users</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="material-icons">book_online</i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{totalBookings}}</div>
            <div class="stat-label">Total Bookings</div>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h3 class="section-title">System Management</h3>
        <div class="actions-grid">
          <div class="action-card">
            <div class="action-icon">
              <i class="material-icons">nature_people</i>
            </div>
            <div class="action-content">
              <h4>Camps Management</h4>
              <p>Create, edit, and manage all camps</p>
            </div>
          </div>

          <div class="action-card">
            <div class="action-icon">
              <i class="material-icons">local_hospital</i>
            </div>
            <div class="action-content">
              <h4>Sanatoriums Management</h4>
              <p>Oversee all sanatorium operations</p>
            </div>
          </div>

          <div class="action-card">
            <div class="action-icon">
              <i class="material-icons">people</i>
            </div>
            <div class="action-content">
              <h4>User Management</h4>
              <p>Manage all user accounts and roles</p>
            </div>
          </div>

          <div class="action-card">
            <div class="action-icon">
              <i class="material-icons">admin_panel_settings</i>
            </div>
            <div class="action-content">
              <h4>Role Management</h4>
              <p>Assign and manage user permissions</p>
            </div>
          </div>
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
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 0.5rem;
    }

    .page-subtitle {
      font-size: 1.1rem;
      color: #6b7280;
      margin: 0;
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
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
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
export class OverviewComponent implements OnInit {
  totalCamps = 45;
  totalSanatoriums = 23;
  totalUsers = 1247;
  totalBookings = 3456;

  constructor() {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    // Load super admin statistics from backend
    // This would be replaced with actual API calls
  }
}