import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, input, OnInit, PLATFORM_ID } from '@angular/core';
import { UiChart } from '../ui/chart';
import { WorkoutStat } from '../../shared/types/Workout';

@Component({
  selector: 'workout-chart',
  imports: [UiChart],
  templateUrl: './workout-chart.html',
})
export class WorkoutChart implements OnInit {
  stat = input.required<WorkoutStat>();

  data: any;
  options: any;

  private platformId = inject(PLATFORM_ID);
  private cd = inject(ChangeDetectorRef);

  ngOnInit() {
    this.initChart();
  }

  initChart() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const primary = documentStyle.getPropertyValue('--color-primary-400') || '#a4d43b';
      const accent = documentStyle.getPropertyValue('--color-primary-700') || '#4f7114';
      const muted = documentStyle.getPropertyValue('--color-surface-400') || '#7c8871';
      const grid = 'rgba(255,255,255,0.06)';

      this.data = {
        labels: this.stat().history.map((h) => h.date),
        datasets: [
          {
            label: 'kg',
            data: this.stat().history.map((h) => h.weight),
            fill: false,
            borderColor: primary,
            pointBackgroundColor: primary,
            tension: 0.5,
            cubicInterpolationMode: 'monotone',
          },
          {
            label: 'reps',
            data: this.stat().history.map((h) => h.reps),
            fill: false,
            borderDash: [5, 5],
            borderColor: accent,
            pointBackgroundColor: accent,
            tension: 1,
          },
        ],
      };

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            ticks: { color: muted },
            grid: { color: 'transparent' },
          },
          y: {
            ticks: { color: muted },
            grid: { color: grid },
          },
        },
      };
      this.cd.markForCheck();
    }
  }
}
