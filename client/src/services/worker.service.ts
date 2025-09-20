import { Injectable, inject } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SwUpdateService {
  private swUpdate = inject(SwUpdate);

  private updateAvailableSubject = new BehaviorSubject<boolean>(false);
  updateAvailable$ = this.updateAvailableSubject.asObservable();

  constructor() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate();

      this.swUpdate.versionUpdates.subscribe(event => {
        if (event.type === 'VERSION_READY') {
          this.updateAvailableSubject.next(true);
        }
      });
    }
  }

  activateUpdate(): Promise<void> {
    return this.swUpdate.activateUpdate().then(() => {
      document.location.reload();
    });
  }
}
