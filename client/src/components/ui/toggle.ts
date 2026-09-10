import { Component, model } from '@angular/core';

@Component({
  selector: 'ui-toggle',
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="checked()"
      class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
      [class]="checked() ? 'bg-primary-500' : 'bg-surface-700'"
      (click)="toggle()"
    >
      <span
        class="inline-block h-4 w-4 transform rounded-full bg-surface-950 shadow transition-transform"
        [class]="checked() ? 'translate-x-6' : 'translate-x-1'"
      ></span>
    </button>
  `,
})
export class UiToggle {
  checked = model<boolean>(false);

  toggle() {
    this.checked.set(!this.checked());
  }
}
