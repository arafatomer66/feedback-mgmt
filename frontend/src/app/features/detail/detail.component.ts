import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../shared/components/toast.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { Feedback, Comment } from '../../core/models';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <a routerLink="/board" class="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-8 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to board
      </a>

      @if (loading()) {
        <div class="space-y-4">
          <div class="skeleton h-8 w-3/4"></div>
          <div class="skeleton h-4 w-full"></div>
          <div class="skeleton h-4 w-2/3"></div>
        </div>
      } @else if (feedback()) {
        <div class="glass-card p-7 mb-6 fade-in">
          <div class="flex items-start justify-between gap-4 flex-wrap mb-4">
            <h1 class="text-2xl font-bold text-white leading-tight">{{ feedback()!.title }}</h1>
            <app-status-badge [status]="feedback()!.status"/>
          </div>

          <p class="text-zinc-300 leading-relaxed whitespace-pre-wrap">{{ feedback()!.description }}</p>

          <div class="flex items-center gap-4 mt-6 pt-5 border-t border-white/5 flex-wrap">
            <button (click)="vote()"
              class="vote-btn"
              [class.voted]="feedback()!.voted"
              [disabled]="!auth.isLoggedIn()">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
              </svg>
              {{ feedback()!.vote_count }}
            </button>

            <span class="category-chip">{{ feedback()!.category }}</span>

            <div class="flex items-center gap-1">
              @for (star of [1,2,3,4,5]; track star) {
                <span class="text-sm" [class.text-amber-400]="star <= feedback()!.rating" [class.text-zinc-700]="star > feedback()!.rating">★</span>
              }
            </div>

            <div class="flex items-center gap-2 ml-auto">
              <img [src]="feedback()!.author?.avatar_url" class="w-7 h-7 rounded-full ring-1 ring-white/10"/>
              <div>
                <p class="text-sm font-medium text-white">{{ feedback()!.author?.name }}</p>
                <p class="text-xs text-zinc-500">{{ feedback()!.created_at | date:'MMM d, y' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Status timeline -->
        <div class="glass-card p-6 mb-6 fade-in">
          <h3 class="text-sm font-semibold text-zinc-300 mb-4">Status Timeline</h3>
          <div class="flex items-center gap-2 overflow-x-auto pb-1">
            @for (step of timeline; track step.status; let last = $last) {
              <div class="flex items-center gap-2 flex-shrink-0">
                <div class="flex flex-col items-center">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    [ngClass]="isAtOrPast(step.status) ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'">
                    @if (isAtOrPast(step.status)) { ✓ } @else { {{ step.num }} }
                  </div>
                  <span class="text-xs mt-1 whitespace-nowrap"
                    [class.text-violet-300]="feedback()!.status === step.status"
                    [class.text-zinc-400]="isAtOrPast(step.status) && feedback()!.status !== step.status"
                    [class.text-zinc-600]="!isAtOrPast(step.status)">
                    {{ step.label }}
                  </span>
                </div>
                @if (!last) {
                  <div class="w-8 h-0.5 flex-shrink-0 mb-4 transition-all"
                    [class.bg-violet-600]="isAtOrPast(step.status)"
                    [class.bg-zinc-700]="!isAtOrPast(step.status)"></div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Comments -->
        <div class="glass-card p-6 fade-in">
          <h3 class="text-sm font-semibold text-zinc-300 mb-5">
            Discussion
            <span class="ml-2 px-2 py-0.5 rounded-full bg-zinc-700 text-xs text-zinc-400">{{ comments().length }}</span>
          </h3>

          @if (comments().length === 0) {
            <p class="text-zinc-500 text-sm text-center py-6">No comments yet. Start the discussion!</p>
          }

          <div class="space-y-4 mb-5">
            @for (c of comments(); track c.id) {
              <div class="flex gap-3" [class.opacity-75]="c.is_internal">
                <img [src]="c.author?.avatar_url" class="w-8 h-8 rounded-full flex-shrink-0 ring-1 ring-white/10"/>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-semibold text-white">{{ c.author?.name }}</span>
                    @if (c.is_internal) {
                      <span class="text-xs px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">Internal</span>
                    }
                    <span class="text-xs text-zinc-500">{{ c.created_at | date:'MMM d' }}</span>
                  </div>
                  <p class="text-sm text-zinc-300 leading-relaxed">{{ c.body }}</p>
                </div>
              </div>
            }
          </div>

          @if (auth.isLoggedIn()) {
            <div class="pt-4 border-t border-white/5">
              <div class="flex gap-3">
                <img [src]="auth.user()?.avatar_url" class="w-8 h-8 rounded-full flex-shrink-0 ring-1 ring-white/10"/>
                <div class="flex-1">
                  <textarea [(ngModel)]="newComment" rows="3" class="input-field resize-none mb-2"
                    placeholder="Add a comment..."></textarea>
                  <div class="flex items-center justify-between">
                    @if (auth.isAdmin()) {
                      <label class="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                        <input type="checkbox" [(ngModel)]="isInternal" class="rounded"/>
                        Internal note
                      </label>
                    } @else { <span></span> }
                    <button (click)="addComment()" class="btn-primary text-sm px-4 py-2" [disabled]="!newComment.trim()">
                      Post comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class DetailComponent implements OnInit {
  feedback = signal<Feedback | null>(null);
  comments = signal<Comment[]>([]);
  loading = signal(true);
  newComment = '';
  isInternal = false;

  timeline = [
    { status: 'OPEN', label: 'Open', num: '1' },
    { status: 'IN_REVIEW', label: 'In Review', num: '2' },
    { status: 'PLANNED', label: 'Planned', num: '3' },
    { status: 'RESOLVED', label: 'Resolved', num: '4' },
  ];

  private statusOrder = ['OPEN', 'IN_REVIEW', 'PLANNED', 'RESOLVED', 'DECLINED'];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public auth: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getFeedbackById(id).subscribe(fb => { this.feedback.set(fb); this.loading.set(false); });
    const getComments = this.auth.isAdmin() ? this.api.getComments(id) : this.api.getPublicComments(id);
    getComments.subscribe(c => this.comments.set(c));
  }

  isAtOrPast(status: string) {
    const curr = this.feedback()?.status;
    if (!curr || curr === 'DECLINED') return status === 'OPEN';
    return this.statusOrder.indexOf(curr) >= this.statusOrder.indexOf(status);
  }

  vote() {
    if (!this.auth.isLoggedIn()) return;
    const fb = this.feedback()!;
    const prev = fb.voted;
    this.feedback.update(f => f ? { ...f, voted: !prev, vote_count: f.vote_count + (prev ? -1 : 1) } : f);
    this.api.toggleVote(fb.id).subscribe({ error: () => this.feedback.update(f => f ? { ...f, voted: prev, vote_count: f.vote_count + (prev ? 1 : -1) } : f) });
  }

  addComment() {
    if (!this.newComment.trim()) return;
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.addComment(id, this.newComment, this.isInternal).subscribe({
      next: (c) => {
        this.comments.update(cs => [...cs, c]);
        this.newComment = ''; this.isInternal = false;
        this.toast.success('Comment posted');
      },
      error: () => this.toast.error('Failed to post comment'),
    });
  }
}
