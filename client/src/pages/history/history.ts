import { Component, inject, OnInit, signal } from '@angular/core';
import { WorkoutsCalendarComponent } from '../../components/workouts-calendar/workouts-calendar';
import { WorkoutsHistory } from '../../components/workouts-history-dialog/workouts-history-dialog';
import { SessionService } from '../../services/sessions.service';
import { WorkoutService } from '../../services/workout.service';
import { Workout } from '../../shared/types/Workout';

@Component({
  selector: 'history-page',
  imports: [WorkoutsCalendarComponent, WorkoutsHistory],
  providers: [],
  templateUrl: './history.html',
})
export class HistoryPage implements OnInit {
  workouts = signal<Workout[]>([]);
  showWorkoutHistory = false;
  selectedDayWorkouts = signal<Workout[]>([]);

  workoutService = inject(WorkoutService);
  sessionService = inject(SessionService);

  ngOnInit() {
    this.loadWorkouts(new Date());
    this.loadSessions();
  }

  loadSessions() {
    this.sessionService.getSessions().subscribe({
      next: (data) => this.sessionService.sessions.set(data),
    });
  }

  loadWorkouts(date?: Date) {
    this.workoutService.getWorkouts(date).subscribe({
      next: (workouts) => this.workouts.set(workouts),
    });
  }

  onDaySelected(workouts: Workout[]) {
    this.selectedDayWorkouts.set(workouts);
    this.showWorkoutHistory = true;
  }

  onDateChanged(date: Date) {
    this.loadWorkouts(date);
  }

  handleWorkoutDelete(workoutId: string) {
    this.workouts.set(this.workouts().filter((w) => w._id !== workoutId));
    this.selectedDayWorkouts.set(this.selectedDayWorkouts().filter((w) => w._id !== workoutId));
  }
}
