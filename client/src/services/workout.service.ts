import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ExerciseType } from '../shared/types/Exercise';
import { Workout } from '../shared/types/Workout';
import { AuthService, HttpMethod } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  private auth = inject(AuthService);

  workouts = signal<Workout[]>([]);
  currentWorkout = signal<Workout | null>(null);
  exercises = signal<ExerciseType[]>([]);

  getWorkouts(): Observable<Workout[]> {
    return (
      this.auth.request<Workout[]>({
        method: HttpMethod.GET,
        path: `${environment.apiUrl}/workouts`,
      }) || []
    );
  }

  deleteWorkout(id: string): Observable<void> {
    return this.auth.request<void>({
      method: HttpMethod.DELETE,
      path: `${environment.apiUrl}/workouts/${id}`,
    });
  }

  saveWorkout(workout: Workout): Observable<Workout> {
    return (
      this.auth.request<Workout>({
        method: HttpMethod.PUT,
        path: `${environment.apiUrl}/workouts`,
        body: workout,
      }) || workout
    );
  }

  createWorkout(workout: Partial<Workout>): Observable<Workout> {
    return (
      this.auth.request<Workout>({
        method: HttpMethod.POST,
        path: `${environment.apiUrl}/workouts`,
        body: workout,
      }) || workout
    );
  }

  getCurrentWorkout(): Observable<Workout | null> {
    return (
      this.auth.request<Workout>({
        method: HttpMethod.GET,
        path: `${environment.apiUrl}/workouts/active`,
      }) || null
    );
  }

  saveCurrentWorkout(workout: Workout): Observable<Workout> {
    return (
      this.auth.request<Workout>({
        method: HttpMethod.POST,
        path: `${environment.apiUrl}/workouts/active`,
        body: workout,
      }) || workout
    );
  }

  clearCurrentWorkout(): Observable<void> {
    return this.auth.request<void>({
      method: HttpMethod.DELETE,
      path: `${environment.apiUrl}/workouts/active`,
    });
  }
}
