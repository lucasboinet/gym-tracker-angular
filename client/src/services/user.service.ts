import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { User } from '../shared/types/User';
import { AuthService, HttpMethod } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private user$ = this.userSubject.asObservable();

  private auth = inject(AuthService);

  constructor() {
    if (this.auth.isLoggedIn()) {
      this.loadUser().subscribe({
        error: () => console.error('Failed to load user on service init'),
      });
    }

    this.auth.addTokenExpiredObserver(() => {
      this.userSubject.next(null);
    });
  }

  public get currentUser(): User | null {
    return this.userSubject.value;
  }

  public loadUser(): Observable<User> {
    return this.auth
      .request<User>({
        method: HttpMethod.GET,
        path: environment.apiUrl + '/auth/me',
      })
      .pipe(tap((user) => this.userSubject.next(user)));
  }

  public clearUser() {
    this.userSubject.next(null);
  }
}
