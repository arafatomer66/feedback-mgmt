import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../shared/components/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      <div class="w-full max-w-md slide-up">
        <div class="text-center mb-8">
          <div class="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 items-center justify-center mb-4 shadow-lg shadow-violet-500/20">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">Welcome back</h1>
          <p class="text-zinc-400 text-sm mt-1">Sign in to FeedbackHub</p>
        </div>

        <div class="glass-card p-8">
          <form (ngSubmit)="submit()" #f="ngForm">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                <input type="email" name="email" [(ngModel)]="email" required
                  class="input-field" placeholder="you@example.com"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
                <input type="password" name="password" [(ngModel)]="password" required
                  class="input-field" placeholder="••••••••"/>
              </div>

              <div class="pt-1">
                <button type="submit" class="btn-primary w-full justify-center py-2.5" [disabled]="loading()">
                  @if (loading()) {
                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in...
                  } @else {
                    Sign in
                  }
                </button>
              </div>
            </div>
          </form>

          <div class="mt-4 p-3 rounded-lg bg-zinc-800/50 border border-white/5">
            <p class="text-xs text-zinc-400 font-medium mb-1">Demo credentials</p>
            <p class="text-xs text-zinc-500">Admin: <button class="text-violet-400 hover:underline" (click)="fillAdmin()">admin&#64;feedbackhub.dev</button></p>
            <p class="text-xs text-zinc-500">User: <button class="text-violet-400 hover:underline" (click)="fillUser()">user&#64;feedbackhub.dev</button></p>
          </div>
        </div>

        <p class="text-center text-sm text-zinc-500 mt-6">
          Don't have an account?
          <a routerLink="/auth/register" class="text-violet-400 hover:text-violet-300 font-medium ml-1">Sign up</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);

  constructor(private auth: AuthService, private router: Router, private toast: ToastService) {}

  fillAdmin() { this.email = 'admin@feedbackhub.dev'; this.password = 'Admin123!'; }
  fillUser() { this.email = 'user@feedbackhub.dev'; this.password = 'User123!'; }

  submit() {
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: () => { this.router.navigate(['/board']); this.toast.success('Welcome back!'); },
      error: () => { this.toast.error('Invalid credentials'); this.loading.set(false); },
    });
  }
}
