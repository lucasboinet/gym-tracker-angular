import { Component, computed, input, model } from '@angular/core';

/**
 * Numeric input with +/- steppers. Two-way `value`.
 * Replaces p-inputNumber.
 */
@Component({
  selector: 'ui-number',
  host: { '[class]': "'block ' + styleClass()" },
  template: `
    <div class="flex w-full items-stretch overflow-hidden rounded-xl border border-surface-700 bg-surface-900">
      <button
        type="button"
        class="flex w-10 shrink-0 items-center justify-center text-surface-300 hover:bg-surface-800 hover:text-primary-400 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        [disabled]="disabled() || atMin()"
        (click)="step(-1)"
      >
        <i class="pi pi-minus text-xs"></i>
      </button>
      <input
        type="text"
        inputmode="decimal"
        [value]="display()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        class="min-w-0 flex-1 bg-transparent text-center text-surface-50 outline-none py-2.5"
        [class]="inputClass()"
        (input)="onInput($event)"
        (blur)="onBlur()"
      />
      <button
        type="button"
        class="flex w-10 shrink-0 items-center justify-center text-surface-300 hover:bg-surface-800 hover:text-primary-400 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        [disabled]="disabled() || atMax()"
        (click)="step(1)"
      >
        <i class="pi pi-plus text-xs"></i>
      </button>
    </div>
  `,
})
export class UiNumber {
  value = model<number | null>(null);
  min = input<number>();
  max = input<number>();
  step_ = input<number>(1, { alias: 'step' });
  maxFractionDigits = input<number>(0);
  suffix = input<string>('');
  placeholder = input<string>('');
  disabled = input<boolean>(false);
  styleClass = input<string>('');
  inputClass = input<string>('');

  display = computed(() => {
    const v = this.value();
    if (v === null || v === undefined || Number.isNaN(v)) return '';
    return `${v}${this.suffix()}`;
  });

  atMin = computed(() => {
    const min = this.min();
    return min !== undefined && (this.value() ?? 0) <= min;
  });

  atMax = computed(() => {
    const max = this.max();
    return max !== undefined && (this.value() ?? 0) >= max;
  });

  step(dir: number) {
    const next = (this.value() ?? 0) + dir * this.step_();
    this.commit(next);
  }

  onInput(event: Event) {
    const raw = (event.target as HTMLInputElement).value.replace(this.suffix(), '');
    if (raw.trim() === '') {
      this.value.set(null);
      return;
    }
    const parsed = parseFloat(raw.replace(',', '.'));
    if (!Number.isNaN(parsed)) this.value.set(parsed);
  }

  onBlur() {
    const v = this.value();
    if (v === null || v === undefined || Number.isNaN(v)) return;
    this.commit(v);
  }

  private commit(value: number) {
    let v = value;
    const min = this.min();
    const max = this.max();
    if (min !== undefined) v = Math.max(min, v);
    if (max !== undefined) v = Math.min(max, v);
    const factor = Math.pow(10, this.maxFractionDigits());
    v = Math.round(v * factor) / factor;
    this.value.set(v);
  }
}
