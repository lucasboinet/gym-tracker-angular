import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { BodyweightEntry } from '../shared/types/Bodyweight';
import { AuthService, HttpMethod } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class BodyweightService {
  private auth = inject(AuthService);

  entries = signal<BodyweightEntry[]>([]);

  getEntries(): Observable<BodyweightEntry[]> {
    return (
      this.auth.request<BodyweightEntry[]>({
        method: HttpMethod.GET,
        path: `${environment.apiUrl}/bodyweight`,
      }) || []
    );
  }

  addEntry(entry: { value: number; date?: string | Date }): Observable<BodyweightEntry> {
    return (
      this.auth.request<BodyweightEntry>({
        method: HttpMethod.POST,
        path: `${environment.apiUrl}/bodyweight`,
        body: entry,
      }) || (entry as BodyweightEntry)
    );
  }

  deleteEntry(id: string): Observable<void> {
    return this.auth.request<void>({
      method: HttpMethod.DELETE,
      path: `${environment.apiUrl}/bodyweight/${id}`,
    });
  }
}
