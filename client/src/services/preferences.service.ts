import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from './storage.service';

/** Device-level UI preferences, persisted in localStorage (no backend). */
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private storage = inject(LocalStorageService);

  private readonly AUTO_REST_KEY = 'gym_tracker_auto_rest';

  readonly autoRest = signal<boolean>(this.storage.getItem(this.AUTO_REST_KEY) === 'true');

  setAutoRest(value: boolean) {
    this.autoRest.set(value);
    this.storage.setItem(this.AUTO_REST_KEY, String(value));
  }
}
