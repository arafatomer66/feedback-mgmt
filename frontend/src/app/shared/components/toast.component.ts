import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl min-w-64 max-w-sm fade-in"
          [ngClass]="{
            'bg-zinc-800 border border-green-500/30 text-green-400': toast.type === 'success',
            'bg-zinc-800 border border-red-500/30 text-red-400': toast.type === 'error',
            'bg-zinc-800 border border-violet-500/30 text-violet-400': toast.type === 'info'
          }">
          @if (toast.type === 'success') { <span class="text-lg">✓</span> }
          @if (toast.type === 'error') { <span class="text-lg">✕</span> }
          @if (toast.type === 'info') { <span class="text-lg">ℹ</span> }
          <span class="text-sm font-medium text-zinc-100">{{ toast.message }}</span>
          <button class="ml-auto text-zinc-500 hover:text-zinc-300" (click)="toastService.dismiss(toast.id)">✕</button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
