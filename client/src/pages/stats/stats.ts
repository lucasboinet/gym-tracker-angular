import { Component, inject, OnInit, signal } from '@angular/core';
import { WorkoutChart } from '../../components/workout-chart/workout-chart';
import { WorkoutService } from '../../services/workout.service';
import { WorkoutStat } from '../../shared/types/Workout';

@Component({
  templateUrl: './stats.html',
  selector: 'stats-page',
  imports: [WorkoutChart],
})
export class StatsPage implements OnInit {
  stats = signal<WorkoutStat[]>([]);

  private workoutService = inject(WorkoutService);

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    this.workoutService.getWorkoutStats().subscribe({
      next: (data) => {
        this.stats.set(data);
      },
      error: (err) => {
        console.error('Failed to fetch workout stats', err);
      },
    });
  }
}
