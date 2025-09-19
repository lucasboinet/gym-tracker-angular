// sw-update.service.ts - Angular Service to handle SW updates
import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { BehaviorSubject, concat, interval } from 'rxjs';
import { first, filter, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SwUpdateService {
  private updateAvailable$ = new BehaviorSubject<boolean>(false);
  private updateBannerVisible$ = new BehaviorSubject<boolean>(false);

  constructor(
    private swUpdate: SwUpdate,
    private appRef: ApplicationRef
  ) {
    this.initializeUpdateCheck();
  }

  get updateAvailable() {
    return this.updateAvailable$.asObservable();
  }

  get updateBannerVisible() {
    return this.updateBannerVisible$.asObservable();
  }

  private initializeUpdateCheck() {
    if (!this.swUpdate.isEnabled) {
      console.log('Service Worker not enabled');
      return;
    }

    // Check for updates when the app becomes stable
    const appIsStable$ = this.appRef.isStable.pipe(
      first(isStable => isStable === true)
    );

    const everySixHours$ = interval(6 * 60 * 60 * 1000);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

    everySixHoursOnceAppIsStable$.subscribe(() => {
      this.swUpdate.checkForUpdate().then(() => {
        console.log('Checked for updates');
      }).catch(err => {
        console.error('Error checking for updates:', err);
      });
    });

    // Listen for version ready events
    this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(event => {
        console.log('New version available:', event);
        this.updateAvailable$.next(true);
        this.showUpdateBanner();
      });

    // Listen for unrecoverable state
    this.swUpdate.unrecoverable.subscribe(event => {
      console.error('Unrecoverable state:', event);
      if (confirm('An error occurred that requires reloading the page. Reload now?')) {
        window.location.reload();
      }
    });

    // Also listen for custom messages from the service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          this.updateAvailable$.next(true);
          this.showUpdateBanner();
        }
      });
    }
  }

  showUpdateBanner() {
    this.updateBannerVisible$.next(true);
  }

  hideUpdateBanner() {
    this.updateBannerVisible$.next(false);
  }

  activateUpdate() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.activateUpdate().then(() => {
        console.log('Update activated, reloading...');
        window.location.reload();
      }).catch(err => {
        console.error('Error activating update:', err);
        // Fallback: reload anyway
        window.location.reload();
      });
    } else {
      // Fallback for when service worker is not enabled
      window.location.reload();
    }
  }

  dismissUpdate() {
    this.hideUpdateBanner();
    this.updateAvailable$.next(false);
  }

  // Manual update check method
  checkForUpdates() {
    if (this.swUpdate.isEnabled) {
      return this.swUpdate.checkForUpdate();
    }
    return Promise.resolve(false);
  }
}