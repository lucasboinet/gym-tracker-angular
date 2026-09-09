import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RestTimerService {
  /** Label of the exercise the current rest belongs to. */
  readonly label = signal<string>('');
  /** Total configured rest duration in seconds. */
  readonly total = signal<number>(0);
  /** Remaining seconds. */
  readonly remaining = signal<number>(0);
  readonly running = signal<boolean>(false);
  /** True once a timer has been started and not yet dismissed. */
  readonly active = computed(() => this.total() > 0 && this.remaining() >= 0 && this.visible());

  private readonly visible = signal<boolean>(false);
  private intervalId: ReturnType<typeof setInterval> | undefined;

  /** Start (or restart) a countdown for the given duration. */
  start(seconds: number, label = '') {
    if (!seconds || seconds <= 0) return;
    this.clearInterval();
    this.label.set(label);
    this.total.set(seconds);
    this.remaining.set(seconds);
    this.visible.set(true);
    this.running.set(true);
    this.tickLoop();
  }

  pause() {
    if (!this.running()) return;
    this.running.set(false);
    this.clearInterval();
  }

  resume() {
    if (this.running() || this.remaining() <= 0) return;
    this.running.set(true);
    this.tickLoop();
  }

  toggle() {
    this.running() ? this.pause() : this.resume();
  }

  /** Add seconds to the remaining time (e.g. +15s button). */
  addTime(seconds: number) {
    if (!this.visible()) return;
    this.remaining.set(this.remaining() + seconds);
    this.total.set(Math.max(this.total(), this.remaining()));
    if (!this.running() && this.remaining() > 0) this.resume();
  }

  /** Skip / dismiss the timer entirely. */
  dismiss() {
    this.clearInterval();
    this.running.set(false);
    this.visible.set(false);
    this.remaining.set(0);
    this.total.set(0);
    this.label.set('');
  }

  private tickLoop() {
    this.clearInterval();
    this.intervalId = setInterval(() => {
      const next = this.remaining() - 1;
      if (next <= 0) {
        this.remaining.set(0);
        this.running.set(false);
        this.clearInterval();
        this.notifyDone();
        return;
      }
      this.remaining.set(next);
    }, 1000);
  }

  private clearInterval() {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private notifyDone() {
    this.vibrate();
    this.beep();
  }

  private vibrate() {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch {
      // ignore
    }
  }

  private beep() {
    try {
      const AudioCtx =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);

      const play = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        osc.start(ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + start + duration,
        );
        osc.stop(ctx.currentTime + start + duration + 0.02);
      };

      play(880, 0, 0.18);
      play(1174, 0.22, 0.22);
      setTimeout(() => ctx.close().catch(() => {}), 800);
    } catch {
      // ignore
    }
  }
}
