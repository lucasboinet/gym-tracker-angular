import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { BehaviorSubject, interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SwUpdateService {
  private updateAvailableSubject = new BehaviorSubject<boolean>(false);
  updateAvailable$ = this.updateAvailableSubject.asObservable();

  private swUpdate = inject(SwUpdate);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId) && this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate();

      interval(6 * 60 * 60 * 1000).subscribe(() => this.swUpdate.checkForUpdate());

      this.swUpdate.versionUpdates.subscribe((event: VersionEvent) => {
        if (event.type === 'VERSION_READY') {
          this.updateAvailableSubject.next(true);
        }
      });
    }
  }

  async activateUpdate(): Promise<void> {
    if (this.swUpdate.isEnabled) {
      return this.swUpdate
        .activateUpdate()
        .then(() => {
          document.location.reload();
        })
        .catch(() => console.warn('No update available'));
    }
  }

  dismissUpdate(): void {
    this.updateAvailableSubject.next(false);
  }
}
