import { Component, inject, OnInit, signal } from '@angular/core';
import { WorkoutsCalendarComponent } from '../../components/workouts-calendar/workouts-calendar';
import { WorkoutsHistory } from '../../components/workouts-history-dialog/workouts-history-dialog';
import { WorkoutService } from '../../services/workout.service';
import { Workout } from '../../shared/types/Workout';

@Component({
  selector: 'sessions-page',
  imports: [WorkoutsCalendarComponent, WorkoutsHistory],
  providers: [],
  templateUrl: './history.html',
})
export class HistoryPage implements OnInit {
  showWorkoutHistory = false;
  selectedDayWorkouts = signal<Workout[]>([]);

  workoutService = inject(WorkoutService);

  ngOnInit(): void {
    this.loadWorkouts();
  }

  loadWorkouts() {
    this.workoutService.getWorkouts().subscribe({
      next: (workouts) => {
        this.workoutService.workouts.set(workouts);
      },
    });
  }

  onDaySelected(workouts: Workout[]): void {
    this.selectedDayWorkouts.set(workouts);
    this.showWorkoutHistory = true;
  }
}
