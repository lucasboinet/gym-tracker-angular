import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { BodyweightChart } from '../../components/bodyweight-chart/bodyweight-chart';
import { UiSelect } from '../../components/ui/select';
import { WorkoutChart } from '../../components/workout-chart/workout-chart';
import { BodyweightService } from '../../services/bodyweight.service';
import { SessionService } from '../../services/sessions.service';
import { SettingsService } from '../../services/settings.service';
import { WorkoutService } from '../../services/workout.service';
import { Session } from '../../shared/types/Session';
import { SETTINGS, SETTINGS_DEFAULT_VALUES } from '../../shared/types/Setting';
import { fromKg, round1 } from '../../shared/units';
import { WorkoutStat } from '../../shared/types/Workout';

@Component({
  templateUrl: './stats.html',
  selector: 'stats-page',
  imports: [WorkoutChart, BodyweightChart, UiSelect],
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
  public bodyweightService = inject(BodyweightService);
  private settingsService = inject(SettingsService);

  unit = computed<string>(
    () =>
      this.settingsService.settings().find((s) => s.slug === SETTINGS.WEIGHT_UNIT)?.value ||
      SETTINGS_DEFAULT_VALUES[SETTINGS.WEIGHT_UNIT],
  );

  /** Latest logged bodyweight in kg. */
  private latestBodyweightKg = computed<number | null>(() => {
    const entries = this.bodyweightService.entries();
    if (!entries.length) return null;
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      .value;
  });

  /** Best (heaviest) single-set weight ever logged, across all exercises, in kg. */
  private bestLiftKg = computed<{ weight: number; exercise: string } | null>(() => {
    let best: { weight: number; exercise: string } | null = null;
    for (const stat of this.stats()) {
      for (const h of stat.history) {
        if (!best || h.weight > best.weight) {
          best = { weight: h.weight, exercise: stat.exerciseName };
        }
      }
    }
    return best && best.weight > 0 ? best : null;
  });

  strengthRatio = computed(() => {
    const bw = this.latestBodyweightKg();
    const lift = this.bestLiftKg();
    if (!bw || !lift) return null;
    return {
      ratio: round1(lift.weight / bw),
      exercise: lift.exercise,
      liftDisplay: round1(fromKg(lift.weight, this.unit())),
      bwDisplay: round1(fromKg(bw, this.unit())),
    };
  });

  ngOnInit() {
    this.fetchStats();
    this.fetchSessions();
    this.fetchBodyweight();
    this.fetchSettings();
  }

  fetchBodyweight() {
    this.bodyweightService.getEntries().subscribe({
      next: (data) => this.bodyweightService.entries.set(data),
      error: (err) => console.error('Failed to fetch bodyweight entries', err),
    });
  }

  fetchSettings() {
    this.settingsService.getSettings().subscribe({
      next: (data) => this.settingsService.settings.set(data),
    });
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

  handleSelectedStatsChange(stat: WorkoutStat | undefined) {
    this.selectedStat.set(stat);
  }

  handleSelectSessionChange(session: Session | undefined) {
    this.selectedSession.set(session);
  }
}
