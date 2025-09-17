import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { User } from "../shared/types/User";
import { AuthService, HttpMethod } from "./auth.service";
import { environment } from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private user$ = this.userSubject.asObservable();

  constructor(
    private auth: AuthService,
  ) {
    if (this.auth.isLoggedIn()) {
      this.loadUser().subscribe({error: () => {}});
    }

    this.auth.addTokenExpiredObserver(() => {
      this.userSubject.next(null);
    })
  }

  public get currentUser(): User | null {
    return this.userSubject.value;
  }

  public loadUser(): Observable<User> {
    return this.auth.request<User>({
      method: HttpMethod.GET,
      path: environment.apiUrl + '/auth/me',
    }).pipe(tap(user => this.userSubject.next(user)));
  }

  public clearUser() {
    this.userSubject.next(null);
  }
}