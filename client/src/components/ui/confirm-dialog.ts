import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../services/confirm.service';
import { UiButton } from './button';

@Component({
  selector: 'ui-confirm-dialog',
  imports: [UiButton],
  template: `
    @if (confirm.current(); as c) {
      <div
        class="ui-anim-fade fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        (click)="confirm.reject()"
      >
        <div
          class="ui-anim-pop w-full max-w-sm rounded-2xl border border-surface-700 bg-surface-900 p-6 shadow-2xl"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-start gap-4">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-500/10"
            >
              <i [class]="(c.icon || 'pi pi-exclamation-triangle') + ' text-primary-400'"></i>
            </div>
            <div class="min-w-0 flex-1 pt-0.5">
              @if (c.header) {
                <h3 class="text-base font-semibold text-surface-50">{{ c.header }}</h3>
              }
              <p class="mt-1 text-sm text-surface-400">{{ c.message }}</p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <ui-button
              variant="ghost"
              size="sm"
              [label]="c.rejectLabel || 'Cancel'"
              (onClick)="confirm.reject()"
            />
            <ui-button
              [variant]="c.acceptVariant || 'primary'"
              size="sm"
              [label]="c.acceptLabel || 'Confirm'"
              (onClick)="confirm.accept()"
            />
          </div>
        </div>
      </div>
    }
  `,
})
export class UiConfirmDialog {
  confirm = inject(ConfirmService);
}
