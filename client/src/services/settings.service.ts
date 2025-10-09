import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Setting } from '../shared/types/Setting';
import { AuthService, HttpMethod } from './auth.service';

interface SettingPayload {
  slug: Setting['slug'];
  value: Setting['value'];
  _id?: Setting['_id'];
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private auth = inject(AuthService);

  settings = signal<Setting[]>([]);

  getSettings(): Observable<Setting[]> {
    return (
      this.auth.request<Setting[]>({
        method: HttpMethod.GET,
        path: `${environment.apiUrl}/settings`,
      }) || []
    );
  }

  deleteSetting(id: string): Observable<void> {
    return this.auth.request<void>({
      method: HttpMethod.DELETE,
      path: `${environment.apiUrl}/settings/${id}`,
    });
  }

  saveSetting(setting: SettingPayload): Observable<Setting> {
    return (
      this.auth.request<Setting>({
        method: HttpMethod.POST,
        path: `${environment.apiUrl}/settings`,
        body: setting,
      }) || setting
    );
  }
}
