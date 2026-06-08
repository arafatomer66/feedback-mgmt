import { Component, OnInit, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { Feedback } from '../../core/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <p class="text-zinc-400 text-sm mt-1">Real-time insights from your feedback data</p>
      </div>

      <!-- KPI Cards -->
      @if (overview()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 fade-in">
          <div class="glass-card p-5">
            <p class="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Total Feedback</p>
            <p class="text-3xl font-bold text-white">{{ overview()!.total }}</p>
            <p class="text-xs text-zinc-500 mt-1">All time</p>
          </div>
          <div class="glass-card p-5">
            <p class="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Open</p>
            <p class="text-3xl font-bold text-blue-400">{{ overview()!.open }}</p>
            <p class="text-xs text-zinc-500 mt-1">Awaiting review</p>
          </div>
          <div class="glass-card p-5">
            <p class="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Resolution Rate</p>
            <p class="text-3xl font-bold text-green-400">{{ overview()!.resolution_rate }}%</p>
            <p class="text-xs text-zinc-500 mt-1">{{ overview()!.resolved }} resolved</p>
          </div>
          <div class="glass-card p-5">
            <p class="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Avg. Resolution</p>
            <p class="text-3xl font-bold text-violet-400">{{ overview()!.avg_resolution_days }}</p>
            <p class="text-xs text-zinc-500 mt-1">Days to resolve</p>
          </div>
        </div>

        <!-- Secondary KPIs -->
        <div class="grid grid-cols-3 gap-4 mb-8">
          <div class="glass-card p-4 text-center">
            <p class="text-2xl font-bold text-amber-400">{{ overview()!.inReview }}</p>
            <p class="text-xs text-zinc-500 mt-1">In Review</p>
          </div>
          <div class="glass-card p-4 text-center">
            <p class="text-2xl font-bold text-violet-400">{{ overview()!.planned }}</p>
            <p class="text-xs text-zinc-500 mt-1">Planned</p>
          </div>
          <div class="glass-card p-4 text-center">
            <p class="text-2xl font-bold text-red-400">{{ overview()!.declined }}</p>
            <p class="text-xs text-zinc-500 mt-1">Declined</p>
          </div>
        </div>
      }

      <!-- Charts row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="lg:col-span-2 glass-card p-6">
          <h3 class="text-sm font-semibold text-zinc-300 mb-5">Submission Volume (30 days)</h3>
          <div class="h-56">
            <canvas #volumeChart></canvas>
          </div>
        </div>
        <div class="glass-card p-6">
          <h3 class="text-sm font-semibold text-zinc-300 mb-5">By Status</h3>
          <div class="h-56">
            <canvas #statusChart></canvas>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="glass-card p-6">
          <h3 class="text-sm font-semibold text-zinc-300 mb-5">By Category</h3>
          <div class="h-56">
            <canvas #categoryChart></canvas>
          </div>
        </div>

        <!-- Top voted -->
        <div class="glass-card p-6">
          <h3 class="text-sm font-semibold text-zinc-300 mb-5">Top Voted</h3>
          <div class="space-y-3">
            @for (item of topVoted(); track item.id; let i = $index) {
              <a [routerLink]="['/board', item.id]" class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group">
                <span class="text-xs font-bold text-zinc-600 w-5">#{{ i + 1 }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-zinc-200 truncate group-hover:text-violet-300 transition-colors">{{ item.title }}</p>
                  <app-status-badge [status]="item.status"/>
                </div>
                <div class="flex items-center gap-1 text-violet-400">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                  </svg>
                  <span class="text-sm font-bold">{{ item.vote_count }}</span>
                </div>
              </a>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('volumeChart') volumeRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryRef!: ElementRef<HTMLCanvasElement>;

  overview = signal<any>(null);
  topVoted = signal<Feedback[]>([]);
  private volumeData: any[] = [];
  private breakdownData: any = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getOverview().subscribe(d => this.overview.set(d));
    this.api.getTopVoted(8).subscribe(d => this.topVoted.set(d));
    this.api.getVolume(30).subscribe(d => { this.volumeData = d; this.renderCharts(); });
    this.api.getBreakdown().subscribe(d => { this.breakdownData = d; this.renderCharts(); });
  }

  ngAfterViewInit() { this.renderCharts(); }

  private renderCharts() {
    if (this.volumeData.length && this.volumeRef) this.renderVolume();
    if (this.breakdownData && this.statusRef) { this.renderStatus(); this.renderCategory(); }
  }

  private chartDefaults = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#a1a1aa', font: { size: 11 } } } },
  };

  private renderVolume() {
    new Chart(this.volumeRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.volumeData.map(d => new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
        datasets: [{
          label: 'Submissions',
          data: this.volumeData.map(d => parseInt(d.count)),
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124,58,237,0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#7c3aed',
          pointRadius: 3,
        }],
      },
      options: {
        ...this.chartDefaults,
        scales: {
          x: { ticks: { color: '#52525b', maxTicksLimit: 6 }, grid: { color: 'rgba(255,255,255,0.03)' } },
          y: { ticks: { color: '#52525b' }, grid: { color: 'rgba(255,255,255,0.03)' }, beginAtZero: true },
        },
      },
    });
  }

  private renderStatus() {
    const data = this.breakdownData.byStatus;
    const colors: Record<string, string> = {
      OPEN: '#60a5fa', IN_REVIEW: '#fbbf24', PLANNED: '#a78bfa', RESOLVED: '#4ade80', DECLINED: '#f87171',
    };
    new Chart(this.statusRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: data.map((d: any) => d.status),
        datasets: [{ data: data.map((d: any) => parseInt(d.count)), backgroundColor: data.map((d: any) => colors[d.status] || '#71717a'), borderWidth: 0 }],
      },
      options: { ...this.chartDefaults, cutout: '65%' },
    });
  }

  private renderCategory() {
    const data = this.breakdownData.byCategory;
    new Chart(this.categoryRef.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map((d: any) => d.category),
        datasets: [{ label: 'Count', data: data.map((d: any) => parseInt(d.count)), backgroundColor: 'rgba(124,58,237,0.7)', borderRadius: 6 }],
      },
      options: {
        ...this.chartDefaults,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#52525b', maxRotation: 30 }, grid: { display: false } },
          y: { ticks: { color: '#52525b' }, grid: { color: 'rgba(255,255,255,0.03)' }, beginAtZero: true },
        },
      },
    });
  }
}
