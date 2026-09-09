import { Component, computed, inject } from '@angular/core';
import { RestTimerService } from '../../services/rest-timer.service';

@Component({
  selector: 'rest-timer',
  templateUrl: './rest-timer.html',
})
export class RestTimer {
  timer = inject(RestTimerService);

  formatted = computed(() => {
    const s = Math.max(0, this.timer.remaining());
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  });

  progress = computed(() => {
    const total = this.timer.total();
    if (!total) return 0;
    return Math.min(100, Math.max(0, (this.timer.remaining() / total) * 100));
  });

  done = computed(() => this.timer.remaining() <= 0);
}
