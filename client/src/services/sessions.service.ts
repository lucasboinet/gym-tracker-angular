import { Injectable } from '@angular/core';
import { Session } from '../shared/types/Session';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService, HttpMethod } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  constructor(
    private auth: AuthService,
  ) {}

  getSessions(): Observable<Session[]> {
    return this.auth.request<Session[]>({
      method: HttpMethod.GET,
      path: `${environment.apiUrl}/sessions`
    }) || [];
  }

  deleteSession(id: string): Observable<void> {
    return this.auth.request<void>({
      method: HttpMethod.DELETE,
      path: `${environment.apiUrl}/sessions/${id}`
    });
  }

  createSession(workout: Session): Observable<Session> {
    return this.auth.request<Session>({
      method: HttpMethod.POST,
      path: `${environment.apiUrl}/sessions`,
      body: workout
    }) || workout;
  }

  updateSession(workout: Session): Observable<Session> {
    return this.auth.request<Session>({
      method: HttpMethod.PUT,
      path: `${environment.apiUrl}/sessions/${workout._id}`,
      body: workout
    }) || workout;
  }

}