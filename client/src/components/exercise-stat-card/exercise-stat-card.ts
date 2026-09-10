import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiChart } from '../ui/chart';
import { estimate1RM } from '../../shared/progression';
import { WorkoutStat } from '../../shared/types/Workout';
import { fromKg, round1 } from '../../shared/units';

/** Compact exercise summary: best/last + a sparkline, links to the detail page. */
@Component({
  selector: 'exercise-stat-card',
  imports: [UiChart, RouterLink],
  templateUrl: './exercise-stat-card.html',
})
export class ExerciseStatCard {
  stat = input.required<WorkoutStat>();
  unit = input<string>('kg');

  best = computed(() => {
    const weights = this.stat().history.map((h) => h.weight);
    return weights.length ? round1(fromKg(Math.max(...weights), this.unit())) : 0;
  });

  bestE1rm = computed(() => {
    const values = this.stat().history.map((h) => estimate1RM(h.weight, h.reps));
    return values.length ? round1(fromKg(Math.max(...values), this.unit())) : 0;
  });

  sessionsCount = computed(() => this.stat().history.length);

  sparkData = computed(() => {
    const primary = '#a4d43b';
    return {
      labels: this.stat().history.map((_, i) => i + 1),
      datasets: [
        {
          data: this.stat().history.map((h) => round1(fromKg(h.weight, this.unit()))),
          borderColor: primary,
          borderWidth: 2,
          tension: 0.4,
          cubicInterpolationMode: 'monotone',
          pointRadius: this.stat().history.length <= 1 ? 3 : 0,
          pointBackgroundColor: primary,
          fill: false,
        },
      ],
    };
  });

  sparkOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    elements: { line: { borderCapStyle: 'round' as const } },
  };
}
