import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

let registered = false;

/** Thin chart.js wrapper. Replaces primeng/chart's p-chart. */
@Component({
  selector: 'ui-chart',
  template: `<div class="relative h-full w-full"><canvas #canvas></canvas></div>`,
})
export class UiChart implements AfterViewInit, OnDestroy {
  type = input<ChartType>('line');
  data = input<any>();
  options = input<any>();

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private platformId = inject(PLATFORM_ID);
  private chart?: Chart;
  private viewReady = false;

  constructor() {
    effect(() => {
      // Track inputs so the chart rebuilds on change.
      this.data();
      this.options();
      this.type();
      if (this.viewReady) this.render();
    });
  }

  ngAfterViewInit() {
    if (!registered) {
      Chart.register(...registerables);
      registered = true;
    }
    this.viewReady = true;
    this.render();
  }

  private render() {
    if (!isPlatformBrowser(this.platformId) || !this.canvasRef) return;
    this.chart?.destroy();
    const config: ChartConfiguration = {
      type: this.type(),
      data: this.data() ?? { labels: [], datasets: [] },
      options: this.options() ?? {},
    };
    this.chart = new Chart(this.canvasRef.nativeElement, config);
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }
}
