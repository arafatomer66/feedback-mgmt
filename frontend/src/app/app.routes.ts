import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/board', pathMatch: 'full' },
  { path: 'board', loadComponent: () => import('./features/board/board.component').then(m => m.BoardComponent) },
  { path: 'board/:id', loadComponent: () => import('./features/detail/detail.component').then(m => m.DetailComponent) },
  { path: 'auth/login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'auth/register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
  { path: 'admin', canActivate: [authGuard, adminGuard], loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent) },
  { path: 'dashboard', canActivate: [authGuard, adminGuard], loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: '**', redirectTo: '/board' },
];
