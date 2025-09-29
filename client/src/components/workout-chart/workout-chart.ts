import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, input, OnInit, PLATFORM_ID } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { WorkoutStat } from '../../shared/types/Workout';

@Component({
  selector: 'workout-chart',
  imports: [ChartModule],
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

      this.data = {
        labels: this.stat().history.map((h) => h.date),
        datasets: [
          {
            label: 'kg',
            data: this.stat().history.map((h) => h.weight),
            fill: false,
            borderColor: documentStyle.getPropertyValue('--p-blue-500'),
            tension: 0.5,
            cubicInterpolationMode: 'monotone',
          },
          {
            label: 'reps',
            data: this.stat().history.map((h) => h.reps),
            fill: false,
            doted: true,
            borderColor: documentStyle.getPropertyValue('--p-orange-200'),
            tension: 1,
          },
        ],
      };

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
          legend: false,
        },
        elements: {
          point: {
            pointBackgroundColor: documentStyle.getPropertyValue('--p-blue-500'),
          },
        },
        scales: {
          x: {
            ticks: {
              color: documentStyle.getPropertyValue('--p-text-muted-color'),
            },
            grid: {
              color: 'transparent',
              drawBorder: false,
            },
          },
          y: {
            ticks: {
              color: documentStyle.getPropertyValue('--p-text-muted-color'),
            },
            grid: {
              drawBorder: false,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }
}
