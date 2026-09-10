import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  auth = inject(AuthService);
  userService = inject(UserService);
  router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    // On the server there is no localStorage, so auth state is unknown. Let the
    // route render and defer the real check to the browser — otherwise every
    // protected route gets a sign-in redirect baked into the SSR HTML.
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    // A valid (non-expired) refresh token is enough to enter — no need to block
    // on the user profile. This avoids the sign-in flash on a hard reload.
    if (!this.auth.isLoggedIn()) {
      return this.router.createUrlTree(['/sign-in'], { queryParams: { returnUrl: state.url } });
    }

    // Load the profile in the background if we don't have it yet. A real auth
    // failure is handled by the HTTP interceptor (refresh → redirect); a
    // transient error must not log the user out here.
    if (!this.userService.currentUser) {
      this.userService.loadUser().subscribe({ error: () => {} });
    }

    return true;
  }
}
