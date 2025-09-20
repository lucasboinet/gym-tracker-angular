import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SwUpdateService {
  private updateAvailableSubject = new BehaviorSubject<boolean>(false);
  updateAvailable$ = this.updateAvailableSubject.asObservable();

  constructor(
    private swUpdate: SwUpdate,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    if (isPlatformBrowser(this.platformId) && this.swUpdate.isEnabled) {
      // Initial check
      this.swUpdate.checkForUpdate();

      // Periodic checks (every 6h)
      interval(6 * 60 * 60 * 1000).subscribe(() => this.swUpdate.checkForUpdate());

      // Listen for updates
      this.swUpdate.versionUpdates.subscribe((event: VersionEvent) => {
        if (event.type === 'VERSION_READY') {
          this.updateAvailableSubject.next(true);
        }
      });
    }
  }

  async activateUpdate(): Promise<void> {
    return this.swUpdate.activateUpdate().then(() => {
      document.location.reload();
    });
  }

  dismissUpdate(): void {
    this.updateAvailableSubject.next(false);
  }
}
