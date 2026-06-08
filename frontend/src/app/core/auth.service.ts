import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(this.loadUser());
  private _token = signal<string | null>(localStorage.getItem('token'));

  user = this._user.asReadonly();
  token = this._token.asReadonly();
  isLoggedIn = computed(() => !!this._token());
  isAdmin = computed(() => this._user()?.role === 'ADMIN');

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<{ access_token: string; user: User }>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => this.persist(res.access_token, res.user))
    );
  }

  register(name: string, email: string, password: string) {
    return this.http.post<{ access_token: string; user: User }>(`${environment.apiUrl}/auth/register`, { name, email, password }).pipe(
      tap(res => this.persist(res.access_token, res.user))
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._token.set(null);
    this._user.set(null);
  }

  private persist(token: string, user: User) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }

  private loadUser(): User | null {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  }
}
