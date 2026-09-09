import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  PLATFORM_ID,
} from '@angular/core';
import { UiChart } from '../ui/chart';
import { formatDateToISO } from '../../shared/dates';
import { BodyweightEntry } from '../../shared/types/Bodyweight';
import { fromKg, round1 } from '../../shared/units';

@Component({
  selector: 'bodyweight-chart',
  imports: [UiChart],
  templateUrl: './bodyweight-chart.html',
})
export class BodyweightChart {
  entries = input.required<BodyweightEntry[]>();
  unit = input<string>('kg');

  data: any;
  options: any;

  private platformId = inject(PLATFORM_ID);
  private cd = inject(ChangeDetectorRef);

  constructor() {
    effect(() => {
      // re-read inputs so the chart rebuilds when data changes
      this.entries();
      this.unit();
      this.initChart();
    });
  }

  private initChart() {
    if (!isPlatformBrowser(this.platformId)) return;

    const documentStyle = getComputedStyle(document.documentElement);
    const primary = documentStyle.getPropertyValue('--color-primary-400') || '#a4d43b';
    const muted = documentStyle.getPropertyValue('--color-surface-400') || '#7c8871';
    const sorted = [...this.entries()].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    this.data = {
      labels: sorted.map((e) => formatDateToISO(new Date(e.date))),
      datasets: [
        {
          label: this.unit(),
          data: sorted.map((e) => round1(fromKg(e.value, this.unit()))),
          fill: false,
          borderColor: primary,
          pointBackgroundColor: primary,
          tension: 0.4,
          cubicInterpolationMode: 'monotone',
        },
      ],
    };

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: muted },
          grid: { color: 'transparent' },
        },
        y: {
          ticks: { color: muted },
          grid: { color: 'rgba(255,255,255,0.06)' },
        },
      },
    };
    this.cd.markForCheck();
  }
}
