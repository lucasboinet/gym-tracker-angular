import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { WorkoutChart } from '../../components/workout-chart/workout-chart';
import { SessionService } from '../../services/sessions.service';
import { WorkoutService } from '../../services/workout.service';
import { Session } from '../../shared/types/Session';
import { WorkoutStat } from '../../shared/types/Workout';

@Component({
  templateUrl: './stats.html',
  selector: 'stats-page',
  imports: [WorkoutChart, FormsModule, SelectModule],
})
export class StatsPage implements OnInit {
  stats = signal<WorkoutStat[]>([]);
  selectedStat = signal<WorkoutStat | undefined>(undefined);
  selectedSession = signal<Session | undefined>(undefined);

  filteredStats = computed(() => {
    let statsToFiler = this.stats();

    if (this.selectedStat()) {
      statsToFiler = statsToFiler.filter(
        (stat) => stat.exerciseName === this.selectedStat()?.exerciseName,
      );
    }

    if (this.selectedSession()) {
      statsToFiler = statsToFiler.filter((stat) =>
        this.selectedSession()?.exercises.find((e) => e.name === stat.exerciseName),
      );
    }

    return statsToFiler;
  });

  private workoutService = inject(WorkoutService);
  public sessionService = inject(SessionService);

  ngOnInit() {
    this.fetchStats();
    this.fetchSessions();
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

  fetchSessions() {
    this.sessionService.getSessions().subscribe({
      next: (sessions) => {
        this.sessionService.sessions.set(sessions);
      },
    });
  }

  handleSelectedStatsChange(stat: WorkoutStat) {
    this.selectedStat.set(stat);
  }

  handleSelectSessionChange(session: Session) {
    this.selectedSession.set(session);
  }
}
