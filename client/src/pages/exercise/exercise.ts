import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UiChart } from '../../components/ui/chart';
import { SettingsService } from '../../services/settings.service';
import { WorkoutService } from '../../services/workout.service';
import { durationFromDate } from '../../shared/dates';
import { estimate1RM } from '../../shared/progression';
import { SETTINGS, SETTINGS_DEFAULT_VALUES } from '../../shared/types/Setting';
import { fromKg, round1 } from '../../shared/units';

interface ExerciseSession {
  workoutId?: string;
  date: Date;
  ago: string;
  bestWeight: number;
  volume: number;
  e1rm: number;
  topSet: { weight: number; reps: number };
  notes?: string;
}

@Component({
  selector: 'exercise-page',
  imports: [UiChart, RouterLink, DatePipe],
  templateUrl: './exercise.html',
})
export class ExercisePage implements OnInit {
  private route = inject(ActivatedRoute);
  private workoutService = inject(WorkoutService);
  private settingsService = inject(SettingsService);

  name = signal<string>('');

  unit = computed<string>(
    () =>
      this.settingsService.settings().find((s) => s.slug === SETTINGS.WEIGHT_UNIT)?.value ||
      SETTINGS_DEFAULT_VALUES[SETTINGS.WEIGHT_UNIT],
  );

  /** All completed sessions containing this exercise, oldest → newest. */
  sessions = computed<ExerciseSession[]>(() => {
    const target = this.name().toLowerCase();
    if (!target) return [];

    return this.workoutService
      .workouts()
      .filter((w) => w.exercises.some((e) => e.name.toLowerCase() === target))
      .map((w) => {
        const ex = w.exercises.find((e) => e.name.toLowerCase() === target)!;
        const sets = ex.sets.filter((s) => s.weight > 0 || s.reps > 0);
        const bestWeight = sets.reduce((m, s) => Math.max(m, s.weight), 0);
        const volume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
        const e1rm = sets.reduce((m, s) => Math.max(m, estimate1RM(s.weight, s.reps)), 0);
        const topSet = sets.reduce(
          (best, s) => (s.weight > best.weight ? { weight: s.weight, reps: s.reps } : best),
          { weight: 0, reps: 0 },
        );
        return {
          workoutId: w._id,
          date: new Date(w.createdAt),
          ago: durationFromDate(new Date(w.createdAt)),
          bestWeight,
          volume,
          e1rm,
          topSet,
          notes: ex.notes,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  hasData = computed(() => this.sessions().length > 0);

  bestWeight = computed(() => Math.max(0, ...this.sessions().map((s) => s.bestWeight)));
  bestE1rm = computed(() => Math.max(0, ...this.sessions().map((s) => s.e1rm)));
  bestVolume = computed(() => Math.max(0, ...this.sessions().map((s) => s.volume)));
  timesPerformed = computed(() => this.sessions().length);

  /** Sessions newest-first for the timeline. */
  timeline = computed(() => [...this.sessions()].reverse());

  e1rmChart = computed(() => this.buildChart(this.sessions().map((s) => round1(fromKg(s.e1rm, this.unit())))));
  volumeChart = computed(() =>
    this.buildChart(this.sessions().map((s) => round1(fromKg(s.volume, this.unit())))),
  );

  chartOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#7c8871' }, grid: { color: 'transparent' } },
      y: { ticks: { color: '#7c8871' }, grid: { color: 'rgba(255,255,255,0.06)' } },
    },
  };

  ngOnInit() {
    const raw = this.route.snapshot.paramMap.get('name') ?? '';
    this.name.set(decodeURIComponent(raw));

    if (this.workoutService.workouts().length === 0) {
      this.workoutService.getWorkouts().subscribe({
        next: (workouts) => this.workoutService.workouts.set(workouts),
      });
    }
    if (this.settingsService.settings().length === 0) {
      this.settingsService.getSettings().subscribe({
        next: (settings) => this.settingsService.settings.set(settings),
      });
    }
  }

  displayWeight(kg: number): number {
    return round1(fromKg(kg, this.unit()));
  }

  private buildChart(data: number[]) {
    const primary = '#a4d43b';
    return {
      labels: this.sessions().map((s) =>
        s.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ),
      datasets: [
        {
          data,
          borderColor: primary,
          pointBackgroundColor: primary,
          tension: 0.4,
          cubicInterpolationMode: 'monotone',
          fill: false,
        },
      ],
    };
  }
}
