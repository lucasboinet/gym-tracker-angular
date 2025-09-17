// guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    if (!this.auth.isLoggedIn()) {
      return of(this.router.createUrlTree(['/sign-in'], { queryParams: { returnUrl: state.url } }));
    }

    if (this.userService.currentUser) {
      return of(true);
    }

    return this.userService.loadUser().pipe(
      map(() => true),
      catchError((err) => {
        this.auth.logout(() => {
          this.router.navigate(['/sign-in']);
        });
        return of(false);
      })
    );
  }
}
