import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../shared/components/toast.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { Feedback, FeedbackStatus } from '../../core/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadgeComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-white">Admin Panel</h1>
          <p class="text-zinc-400 text-sm mt-1">Manage all feedback submissions</p>
        </div>
        <div class="flex items-center gap-2 text-sm text-zinc-400 glass-card px-4 py-2">
          <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          {{ total() }} total items
        </div>
      </div>

      <!-- Filters -->
      <div class="glass-card p-4 mb-6 flex flex-wrap gap-4 items-center">
        <select [(ngModel)]="filterStatus" (change)="load()" class="input-field w-auto">
          <option value="">All Statuses</option>
          @for (s of statuses; track s) { <option [value]="s">{{ statusLabel(s) }}</option> }
        </select>
        <select [(ngModel)]="filterCategory" (change)="load()" class="input-field w-auto">
          <option value="">All Categories</option>
          @for (c of categories; track c) { <option [value]="c">{{ c }}</option> }
        </select>
        <select [(ngModel)]="sortBy" (change)="load()" class="input-field w-auto">
          <option value="date">Newest First</option>
          <option value="votes">Most Voted</option>
        </select>
        <span class="ml-auto text-sm text-zinc-500">{{ items().length }} shown</span>
      </div>

      <!-- Table -->
      <div class="glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-white/5">
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Feedback</th>
                <th class="text-left px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide w-28">Status</th>
                <th class="text-left px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide w-32">Category</th>
                <th class="text-center px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide w-20">Votes</th>
                <th class="text-left px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide w-36">Author</th>
                <th class="text-right px-5 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide w-40">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              @if (loading()) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr>
                    <td colspan="6" class="px-5 py-4">
                      <div class="skeleton h-5 w-full"></div>
                    </td>
                  </tr>
                }
              }
              @for (item of items(); track item.id) {
                <tr class="hover:bg-white/2 transition-colors group">
                  <td class="px-5 py-4">
                    <a [routerLink]="['/board', item.id]" class="text-sm font-medium text-white hover:text-violet-300 transition-colors line-clamp-1">
                      {{ item.title }}
                    </a>
                    <p class="text-xs text-zinc-500 mt-0.5 line-clamp-1">{{ item.description }}</p>
                  </td>
                  <td class="px-4 py-4">
                    <select class="input-field text-xs py-1 px-2 w-28"
                      [value]="item.status"
                      (change)="changeStatus(item, $any($event.target).value)">
                      @for (s of statuses; track s) { <option [value]="s">{{ statusLabel(s) }}</option> }
                    </select>
                  </td>
                  <td class="px-4 py-4">
                    <span class="category-chip text-xs">{{ item.category }}</span>
                  </td>
                  <td class="px-4 py-4 text-center">
                    <span class="text-sm font-semibold text-zinc-300">{{ item.vote_count }}</span>
                  </td>
                  <td class="px-4 py-4">
                    <div class="flex items-center gap-2">
                      <img [src]="item.author?.avatar_url" class="w-6 h-6 rounded-full"/>
                      <span class="text-xs text-zinc-400 truncate max-w-20">{{ item.author?.name }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a [routerLink]="['/board', item.id]" class="btn-ghost text-xs px-2 py-1">View</a>
                      @if (mergeMode() === item.id) {
                        <div class="flex gap-1">
                          <input type="text" [(ngModel)]="mergeTargetId" placeholder="Target ID"
                            class="input-field text-xs py-1 px-2 w-28"/>
                          <button (click)="confirmMerge(item)" class="btn-primary text-xs px-2 py-1">Merge</button>
                          <button (click)="mergeMode.set('')" class="btn-ghost text-xs px-2 py-1">✕</button>
                        </div>
                      } @else {
                        <button (click)="mergeMode.set(item.id)" class="btn-ghost text-xs px-2 py-1">Merge</button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (pages() > 1) {
          <div class="flex items-center justify-center gap-2 py-4 border-t border-white/5">
            <button (click)="setPage(page() - 1)" [disabled]="page() === 1" class="btn-ghost px-3 py-1.5 text-sm">←</button>
            <span class="text-sm text-zinc-400">Page {{ page() }} of {{ pages() }}</span>
            <button (click)="setPage(page() + 1)" [disabled]="page() === pages()" class="btn-ghost px-3 py-1.5 text-sm">→</button>
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminComponent implements OnInit {
  items = signal<Feedback[]>([]);
  loading = signal(true);
  total = signal(0);
  page = signal(1);
  pages = signal(1);
  mergeMode = signal('');
  mergeTargetId = '';

  filterStatus = '';
  filterCategory = '';
  sortBy = 'date';

  statuses: FeedbackStatus[] = ['OPEN', 'IN_REVIEW', 'PLANNED', 'RESOLVED', 'DECLINED'];
  categories = ['Bug Report', 'Feature Request', 'UX Improvement', 'Performance', 'Documentation', 'Integration'];

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.getFeedback({ page: this.page(), limit: 20, status: this.filterStatus, category: this.filterCategory, sort: this.sortBy }).subscribe({
      next: res => { this.items.set(res.items); this.total.set(res.total); this.pages.set(res.pages); this.loading.set(false); },
    });
  }

  setPage(p: number) { this.page.set(p); this.load(); }

  statusLabel(s: string) {
    const m: Record<string, string> = { OPEN: 'Open', IN_REVIEW: 'In Review', PLANNED: 'Planned', RESOLVED: 'Resolved', DECLINED: 'Declined' };
    return m[s] || s;
  }

  changeStatus(item: Feedback, status: FeedbackStatus) {
    this.api.updateStatus(item.id, status).subscribe({
      next: () => { item.status = status; this.toast.success('Status updated'); },
      error: () => this.toast.error('Failed to update'),
    });
  }

  confirmMerge(item: Feedback) {
    if (!this.mergeTargetId.trim()) return;
    this.api.mergeFeedback(item.id, this.mergeTargetId).subscribe({
      next: () => { this.toast.success('Merged successfully'); this.mergeMode.set(''); this.mergeTargetId = ''; this.load(); },
      error: () => this.toast.error('Merge failed'),
    });
  }
}
