import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../shared/components/toast.service';
import { FeedbackCategory } from '../../core/models';

const CATEGORIES: FeedbackCategory[] = ['Bug Report', 'Feature Request', 'UX Improvement', 'Performance', 'Documentation', 'Integration'];

@Component({
  selector: 'app-submit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" (click)="close.emit()">
      <div class="glass-card w-full max-w-lg p-6 slide-up" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-white">Submit feedback</h2>
          <button (click)="close.emit()" class="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form (ngSubmit)="submit()">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-1.5">Title <span class="text-red-400">*</span></label>
              <input type="text" [(ngModel)]="title" name="title" required minlength="5"
                class="input-field" placeholder="Short, clear description of your feedback"/>
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-1.5">Description <span class="text-red-400">*</span></label>
              <textarea [(ngModel)]="description" name="description" required minlength="10" rows="4"
                class="input-field resize-none" placeholder="Provide details — what's the issue or what would you like to see?"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-1.5">Category</label>
                <select [(ngModel)]="category" name="category" class="input-field">
                  @for (c of categories; track c) {
                    <option [value]="c">{{ c }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-1.5">Rating</label>
                <div class="flex items-center gap-1 mt-2">
                  @for (star of [1,2,3,4,5]; track star) {
                    <button type="button" (click)="rating = star"
                      class="text-2xl transition-transform hover:scale-110 focus:outline-none"
                      [class.text-amber-400]="star <= rating"
                      [class.text-zinc-700]="star > rating">★</button>
                  }
                </div>
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" (click)="close.emit()" class="btn-ghost flex-1 justify-center">Cancel</button>
              <button type="submit" class="btn-primary flex-1 justify-center" [disabled]="loading()">
                @if (loading()) { Submitting... } @else { Submit feedback }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class SubmitModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  title = '';
  description = '';
  category: FeedbackCategory = 'Feature Request';
  rating = 4;
  loading = signal(false);
  categories = CATEGORIES;

  constructor(private api: ApiService, private toast: ToastService) {}

  submit() {
    if (!this.title || !this.description) return;
    this.loading.set(true);
    this.api.createFeedback({ title: this.title, description: this.description, category: this.category, rating: this.rating }).subscribe({
      next: () => {
        this.toast.success('Feedback submitted!');
        this.submitted.emit();
        this.close.emit();
      },
      error: () => { this.toast.error('Failed to submit'); this.loading.set(false); },
    });
  }
}
