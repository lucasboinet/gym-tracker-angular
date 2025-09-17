import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Workout } from '../shared/types/Workout';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private http = inject(HttpClient);

  getWorkouts(): Observable<Workout[]> {
    return this.http.get<Workout[]>(`${environment.apiUrl}/workouts`) || [];
  }

  deleteWorkout(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/workouts/${id}`);
  }

  saveWorkout(workout: Workout): Observable<Workout> {
    return this.http.patch<Workout>(`${environment.apiUrl}/workouts`, workout) || workout;
  }

  createWorkout(workout: Workout): Observable<Workout> {
    return this.http.post<Workout>(`${environment.apiUrl}/workouts`, workout) || workout;
  }

  getCurrentWorkout(): Observable<Workout | null> {
    return this.http.get<Workout>(`${environment.apiUrl}/workouts/active`) || null;
  }

  saveCurrentWorkout(workout: Workout): Observable<Workout> {
    return this.http.post<Workout>(`${environment.apiUrl}/workouts/active`, workout) || workout;
  }

  clearCurrentWorkout(): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/workouts/active`);
  }
}