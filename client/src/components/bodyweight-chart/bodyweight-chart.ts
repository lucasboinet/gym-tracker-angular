import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  PLATFORM_ID,
} from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { formatDateToISO } from '../../shared/dates';
import { BodyweightEntry } from '../../shared/types/Bodyweight';
import { fromKg, round1 } from '../../shared/units';

@Component({
  selector: 'bodyweight-chart',
  imports: [ChartModule],
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
          borderColor: documentStyle.getPropertyValue('--p-blue-500'),
          tension: 0.4,
          cubicInterpolationMode: 'monotone',
        },
      ],
    };

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: { legend: false },
      elements: {
        point: { pointBackgroundColor: documentStyle.getPropertyValue('--p-blue-500') },
      },
      scales: {
        x: {
          ticks: { color: documentStyle.getPropertyValue('--p-text-muted-color') },
          grid: { color: 'transparent', drawBorder: false },
        },
        y: {
          ticks: { color: documentStyle.getPropertyValue('--p-text-muted-color') },
          grid: { drawBorder: false },
        },
      },
    };
    this.cd.markForCheck();
  }
}
