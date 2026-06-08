import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../shared/components/toast.service';

@Component({
  selector: 'app-register',
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">Create account</h1>
          <p class="text-zinc-400 text-sm mt-1">Join FeedbackHub</p>
        </div>

        <div class="glass-card p-8">
          <form (ngSubmit)="submit()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-1.5">Full name</label>
                <input type="text" name="name" [(ngModel)]="name" required
                  class="input-field" placeholder="Your name"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                <input type="email" name="email" [(ngModel)]="email" required
                  class="input-field" placeholder="you@example.com"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
                <input type="password" name="password" [(ngModel)]="password" required minlength="6"
                  class="input-field" placeholder="At least 6 characters"/>
              </div>
              <button type="submit" class="btn-primary w-full justify-center py-2.5 mt-2" [disabled]="loading()">
                @if (loading()) { Creating... } @else { Create account }
              </button>
            </div>
          </form>
        </div>

        <p class="text-center text-sm text-zinc-500 mt-6">
          Already have an account?
          <a routerLink="/auth/login" class="text-violet-400 hover:text-violet-300 font-medium ml-1">Sign in</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  name = ''; email = ''; password = '';
  loading = signal(false);

  constructor(private auth: AuthService, private router: Router, private toast: ToastService) {}

  submit() {
    this.loading.set(true);
    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => { this.router.navigate(['/board']); this.toast.success('Account created!'); },
      error: (e) => { this.toast.error(e.error?.message || 'Registration failed'); this.loading.set(false); },
    });
  }
}
