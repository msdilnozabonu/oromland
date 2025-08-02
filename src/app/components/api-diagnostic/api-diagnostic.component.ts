import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkService } from '../../services/network.service';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-api-diagnostic',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="diagnostic-panel">
      <h3>API Connection Diagnostic</h3>
      
      <div class="status-section">
        <h4>Network Status</h4>
        <div class="status-item">
          <span class="label">Browser Online:</span>
          <span [class]="networkStatus?.isOnline ? 'status-good' : 'status-bad'">
            {{ networkStatus?.isOnline ? 'Yes' : 'No' }}
          </span>
        </div>
        <div class="status-item">
          <span class="label">Backend Reachable:</span>
          <span [class]="networkStatus?.backendReachable ? 'status-good' : 'status-bad'">
            {{ networkStatus?.backendReachable ? 'Yes' : 'No' }}
          </span>
        </div>
        <div class="status-item" *ngIf="networkStatus?.latency">
          <span class="label">Latency:</span>
          <span class="status-info">{{ networkStatus.latency }}ms</span>
        </div>
        <div class="status-item">
          <span class="label">Last Checked:</span>
          <span class="status-info">{{ networkStatus?.lastChecked | date:'medium' }}</span>
        </div>
      </div>

      <div class="config-section">
        <h4>Configuration</h4>
        <div class="config-item">
          <span class="label">API URL:</span>
          <span class="config-value">{{ apiUrl }}</span>
        </div>
        <div class="config-item">
          <span class="label">Environment:</span>
          <span class="config-value">{{ environment.production ? 'Production' : 'Development' }}</span>
        </div>
      </div>

      <div class="test-section">
        <h4>Connection Tests</h4>
        <button (click)="testConnection()" [disabled]="testing">
          {{ testing ? 'Testing...' : 'Test Connection' }}
        </button>
        <button (click)="runDiagnostic()" [disabled]="diagnosing">
          {{ diagnosing ? 'Diagnosing...' : 'Run Full Diagnostic' }}
        </button>
      </div>

      <div class="results-section" *ngIf="testResults.length > 0">
        <h4>Test Results</h4>
        <div class="result-item" *ngFor="let result of testResults">
          <span class="timestamp">{{ result.timestamp | date:'HH:mm:ss' }}</span>
          <span [class]="result.success ? 'status-good' : 'status-bad'">
            {{ result.message }}
          </span>
        </div>
      </div>

      <div class="diagnostic-results" *ngIf="diagnosticResults">
        <h4>Diagnostic Results</h4>
        <div class="diagnostic-item">
          <span class="label">DNS Resolution:</span>
          <span [class]="diagnosticResults.dnsResolution ? 'status-good' : 'status-bad'">
            {{ diagnosticResults.dnsResolution ? 'OK' : 'Failed' }}
          </span>
        </div>
        <div class="diagnostic-item">
          <span class="label">CORS Issues:</span>
          <span [class]="diagnosticResults.corsIssue ? 'status-bad' : 'status-good'">
            {{ diagnosticResults.corsIssue ? 'Detected' : 'None' }}
          </span>
        </div>
        <div class="diagnostic-item">
          <span class="label">SSL Issues:</span>
          <span [class]="diagnosticResults.sslIssue ? 'status-bad' : 'status-good'">
            {{ diagnosticResults.sslIssue ? 'Detected' : 'None' }}
          </span>
        </div>
        <div class="diagnostic-item">
          <span class="label">Timeout Issues:</span>
          <span [class]="diagnosticResults.timeoutIssue ? 'status-bad' : 'status-good'">
            {{ diagnosticResults.timeoutIssue ? 'Detected' : 'None' }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .diagnostic-panel {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      margin: 20px;
      font-family: monospace;
    }

    .status-section, .config-section, .test-section, .results-section, .diagnostic-results {
      margin-bottom: 20px;
    }

    .status-item, .config-item, .diagnostic-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding: 4px 0;
    }

    .label {
      font-weight: bold;
      min-width: 150px;
    }

    .status-good {
      color: #28a745;
      font-weight: bold;
    }

    .status-bad {
      color: #dc3545;
      font-weight: bold;
    }

    .status-info {
      color: #6c757d;
    }

    .config-value {
      color: #007bff;
      word-break: break-all;
    }

    button {
      margin-right: 10px;
      padding: 8px 16px;
      border: 1px solid #007bff;
      background: #007bff;
      color: white;
      border-radius: 4px;
      cursor: pointer;
    }

    button:disabled {
      background: #6c757d;
      border-color: #6c757d;
      cursor: not-allowed;
    }

    .result-item {
      display: flex;
      gap: 10px;
      margin-bottom: 4px;
      padding: 4px;
      border-left: 3px solid #ddd;
      padding-left: 8px;
    }

    .timestamp {
      color: #6c757d;
      font-size: 0.9em;
      min-width: 80px;
    }

    h3, h4 {
      color: #333;
      margin-bottom: 10px;
    }
  `]
})
export class ApiDiagnosticComponent implements OnInit {
  networkStatus: any;
  apiUrl = environment.apiUrl;
  environment = environment;
  testing = false;
  diagnosing = false;
  testResults: Array<{timestamp: Date, message: string, success: boolean}> = [];
  diagnosticResults: any;

  constructor(
    private networkService: NetworkService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.networkService.networkStatus$.subscribe(status => {
      this.networkStatus = status;
    });
  }

  testConnection() {
    this.testing = true;
    this.apiService.testConnection().subscribe({
      next: () => {
        this.addTestResult('Connection test successful', true);
        this.testing = false;
      },
      error: (error: any) => {
        this.addTestResult(`Connection test failed: ${error.message || 'Unknown error'}`, false);
        this.testing = false;
      }
    });
  }

  runDiagnostic() {
    this.diagnosing = true;
    this.networkService.diagnoseConnection().subscribe({
      next: (results) => {
        this.diagnosticResults = results;
        this.addTestResult('Diagnostic completed', true);
        this.diagnosing = false;
      },
      error: (error: any) => {
        this.addTestResult(`Diagnostic failed: ${error.message || 'Unknown error'}`, false);
        this.diagnosing = false;
      }
    });
  }

  private addTestResult(message: string, success: boolean) {
    this.testResults.unshift({
      timestamp: new Date(),
      message,
      success
    });
    
    // Keep only last 10 results
    if (this.testResults.length > 10) {
      this.testResults = this.testResults.slice(0, 10);
    }
  }
}