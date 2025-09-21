import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, isDevMode, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { provideServiceWorker } from '@angular/service-worker';
import { UserService } from '../services/user.service';
import AppTheme from './theme.preset';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withInterceptorsFromDi(),
      withFetch(),
    ),
    provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: AppTheme,
            options: {
              darkModelSelector: false,
            }
        }
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideAppInitializer(() => {
      const auth = inject(UserService);
      return auth.loadUser();
    }),
    { provide: HTTP_INTERCEPTORS, useClass: AuthService, multi: true }, 
  ]
};
