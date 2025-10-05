import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Session } from '../shared/types/Session';
import { AuthService, HttpMethod } from './auth.service';

interface SessionPayload {
  name: Session['name'];
  exercises: Session['exercises'];
  color: Session['color'];
  _id?: Session['_id'];
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private auth = inject(AuthService);

  sessions = signal<Session[]>([]);

  getSessions(): Observable<Session[]> {
    return (
      this.auth.request<Session[]>({
        method: HttpMethod.GET,
        path: `${environment.apiUrl}/sessions`,
      }) || []
    );
  }

  deleteSession(id: string): Observable<void> {
    return this.auth.request<void>({
      method: HttpMethod.DELETE,
      path: `${environment.apiUrl}/sessions/${id}`,
    });
  }

  createSession(session: SessionPayload): Observable<Session> {
    return (
      this.auth.request<Session>({
        method: HttpMethod.POST,
        path: `${environment.apiUrl}/sessions`,
        body: session,
      }) || session
    );
  }

  updateSession(session: SessionPayload): Observable<Session> {
    return (
      this.auth.request<Session>({
        method: HttpMethod.PUT,
        path: `${environment.apiUrl}/sessions/${session._id}`,
        body: session,
      }) || session
    );
  }
}
