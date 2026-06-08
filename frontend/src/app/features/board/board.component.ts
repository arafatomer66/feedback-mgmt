import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../shared/components/toast.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { SubmitModalComponent } from './submit-modal.component';
import { Feedback, FeedbackCategory, FeedbackStatus } from '../../core/models';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent, SubmitModalComponent],
  template: `
    <div class="min-h-screen">
      <!-- Hero -->
      <div class="relative border-b border-white/5 bg-gradient-to-b from-violet-950/20 to-transparent">
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/5 rounded-full blur-3xl"></div>
        </div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-5">
            <span class="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
            {{ total() }} ideas and counting
          </div>
          <h1 class="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Shape the future of<br>
            <span class="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">FeedbackHub</span>
          </h1>
          <p class="text-zinc-400 text-lg max-w-xl mx-auto mb-8">
            Share ideas, vote on features, and see what we're building next.
          </p>
          @if (auth.isLoggedIn()) {
            <button (click)="showModal.set(true)" class="btn-primary text-base px-6 py-3 shadow-xl shadow-violet-500/20">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Submit feedback
            </button>
          } @else {
            <a routerLink="/auth/login" class="btn-primary text-base px-6 py-3">Sign in to submit</a>
          }
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col lg:flex-row gap-8">

          <!-- Sidebar filters -->
          <aside class="lg:w-60 flex-shrink-0">
            <div class="glass-card p-5 sticky top-24">
              <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Sort by</h3>
              <div class="space-y-1 mb-5">
                @for (s of sorts; track s.value) {
                  <button (click)="setSort(s.value)"
                    class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                    [ngClass]="sort() === s.value ? 'bg-violet-500/15 text-violet-300' : 'text-zinc-400 hover:text-zinc-200'">
                    {{ s.label }}
                  </button>
                }
              </div>

              <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Status</h3>
              <div class="space-y-1 mb-5">
                <button (click)="setStatus('')"
                  class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                  [ngClass]="!filterStatus() ? 'bg-violet-500/15 text-violet-300' : 'text-zinc-400 hover:text-zinc-200'">All</button>
                @for (s of statuses; track s) {
                  <button (click)="setStatus(s)"
                    class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                    [ngClass]="filterStatus() === s ? 'bg-violet-500/15 text-violet-300' : 'text-zinc-400 hover:text-zinc-200'">
                    {{ statusLabel(s) }}
                  </button>
                }
              </div>

              <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Category</h3>
              <div class="space-y-1">
                <button (click)="setCategory('')"
                  class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                  [ngClass]="!filterCategory() ? 'bg-violet-500/15 text-violet-300' : 'text-zinc-400 hover:text-zinc-200'">All</button>
                @for (c of categories; track c) {
                  <button (click)="setCategory(c)"
                    class="w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors"
                    [ngClass]="filterCategory() === c ? 'bg-violet-500/15 text-violet-300' : 'text-zinc-400 hover:text-zinc-200'">
                    {{ c }}
                  </button>
                }
              </div>
            </div>
          </aside>

          <!-- Feed -->
          <div class="flex-1 min-w-0">
            @if (loading()) {
              <div class="space-y-3">
                @for (i of [1,2,3,4,5]; track i) {
                  <div class="glass-card p-5">
                    <div class="flex gap-4">
                      <div class="skeleton w-12 h-16 flex-shrink-0"></div>
                      <div class="flex-1 space-y-2">
                        <div class="skeleton h-5 w-3/4"></div>
                        <div class="skeleton h-4 w-full"></div>
                        <div class="skeleton h-4 w-1/2"></div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else if (items().length === 0) {
              <div class="text-center py-20">
                <div class="text-5xl mb-4">💬</div>
                <p class="text-zinc-400">No feedback found. Be the first!</p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (item of items(); track item.id) {
                  <div class="glass-card p-5 hover:border-white/15 transition-all duration-200 group fade-in">
                    <div class="flex gap-4">
                      <!-- Vote -->
                      <button (click)="vote(item, $event)"
                        class="vote-btn flex-shrink-0"
                        [class.voted]="item.voted"
                        [disabled]="!auth.isLoggedIn()">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                        </svg>
                        {{ item.vote_count }}
                      </button>

                      <!-- Content -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-3 flex-wrap">
                          <a [routerLink]="['/board', item.id]"
                            class="text-base font-semibold text-white hover:text-violet-300 transition-colors line-clamp-1">
                            {{ item.title }}
                          </a>
                          <app-status-badge [status]="item.status"/>
                        </div>
                        <p class="text-sm text-zinc-400 mt-1 line-clamp-2">{{ item.description }}</p>
                        <div class="flex items-center gap-3 mt-3 flex-wrap">
                          <span class="category-chip">{{ item.category }}</span>
                          <div class="flex items-center gap-1.5 text-xs text-zinc-500">
                            <img [src]="item.author?.avatar_url" class="w-4 h-4 rounded-full"/>
                            {{ item.author?.name }}
                          </div>
                          <span class="text-xs text-zinc-600">{{ item.created_at | date:'MMM d, y' }}</span>
                          <div class="flex items-center gap-1">
                            @for (star of [1,2,3,4,5]; track star) {
                              <span class="text-xs" [class.text-amber-400]="star <= item.rating" [class.text-zinc-700]="star > item.rating">★</span>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Pagination -->
              @if (pages() > 1) {
                <div class="flex items-center justify-center gap-2 mt-8">
                  <button (click)="setPage(page() - 1)" [disabled]="page() === 1" class="btn-ghost px-3 py-2">←</button>
                  @for (p of pageNumbers(); track p) {
                    <button (click)="setPage(p)"
                      class="w-9 h-9 rounded-lg text-sm font-medium transition-colors"
                      [ngClass]="p === page() ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-zinc-200'">{{ p }}</button>
                  }
                  <button (click)="setPage(page() + 1)" [disabled]="page() === pages()" class="btn-ghost px-3 py-2">→</button>
                </div>
              }
            }
          </div>
        </div>
      </div>
    </div>

    @if (showModal()) {
      <app-submit-modal (close)="showModal.set(false)" (submitted)="load()"/>
    }
  `,
})
export class BoardComponent implements OnInit {
  items = signal<Feedback[]>([]);
  loading = signal(true);
  total = signal(0);
  page = signal(1);
  pages = signal(1);
  sort = signal('votes');
  filterStatus = signal('');
  filterCategory = signal('');
  showModal = signal(false);

  sorts = [{ value: 'votes', label: 'Most Voted' }, { value: 'date', label: 'Newest' }];
  statuses = ['OPEN', 'IN_REVIEW', 'PLANNED', 'RESOLVED', 'DECLINED'] as FeedbackStatus[];
  categories = ['Bug Report', 'Feature Request', 'UX Improvement', 'Performance', 'Documentation', 'Integration'] as FeedbackCategory[];

  constructor(public auth: AuthService, private api: ApiService, private toast: ToastService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.getFeedback({ page: this.page(), limit: 15, sort: this.sort(), status: this.filterStatus(), category: this.filterCategory() }).subscribe({
      next: (res) => {
        this.items.set(res.items);
        this.total.set(res.total);
        this.pages.set(res.pages);
        this.loading.set(false);
      },
    });
  }

  setSort(v: string) { this.sort.set(v); this.page.set(1); this.load(); }
  setStatus(v: string) { this.filterStatus.set(v); this.page.set(1); this.load(); }
  setCategory(v: string) { this.filterCategory.set(v); this.page.set(1); this.load(); }
  setPage(p: number) { this.page.set(p); this.load(); }

  statusLabel(s: string) {
    const m: Record<string, string> = { OPEN: 'Open', IN_REVIEW: 'In Review', PLANNED: 'Planned', RESOLVED: 'Resolved', DECLINED: 'Declined' };
    return m[s] || s;
  }

  pageNumbers() {
    const p = this.pages(); return Array.from({ length: Math.min(p, 7) }, (_, i) => i + 1);
  }

  vote(item: Feedback, e: Event) {
    e.preventDefault(); e.stopPropagation();
    if (!this.auth.isLoggedIn()) { this.toast.error('Sign in to vote'); return; }
    const prev = item.voted;
    item.voted = !prev;
    item.vote_count += prev ? -1 : 1;
    this.api.toggleVote(item.id).subscribe({
      error: () => { item.voted = prev; item.vote_count += prev ? 1 : -1; },
    });
  }
}
