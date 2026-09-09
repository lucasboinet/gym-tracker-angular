import { Component, inject } from '@angular/core';
import { ToastMessage, ToastService, ToastSeverity } from '../../services/toast.service';

@Component({
  selector: 'ui-toast',
  template: `
    <div class="pointer-events-none fixed inset-x-0 top-0 z-[200] flex flex-col items-center gap-2 p-4">
      @for (msg of toast.messages(); track msg.id) {
        <div
          class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-surface-850/95 p-3.5 shadow-2xl backdrop-blur"
          [class]="border(msg.severity)"
        >
          <i class="pi mt-0.5" [class]="icon(msg.severity) + ' ' + accent(msg.severity)"></i>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-surface-50">{{ msg.summary }}</p>
            @if (msg.detail) {
              <p class="mt-0.5 text-xs text-surface-400">{{ msg.detail }}</p>
            }
          </div>
          <button
            type="button"
            class="shrink-0 text-surface-500 hover:text-surface-200 cursor-pointer"
            (click)="toast.remove(msg.id)"
          >
            <i class="pi pi-times text-xs"></i>
          </button>
        </div>
      }
    </div>
  `,
})
export class UiToast {
  toast = inject(ToastService);

  icon(severity: ToastSeverity): string {
    return {
      success: 'pi-check-circle',
      error: 'pi-times-circle',
      warn: 'pi-exclamation-triangle',
      info: 'pi-info-circle',
    }[severity];
  }

  accent(severity: ToastSeverity): string {
    return {
      success: 'text-primary-400',
      error: 'text-red-400',
      warn: 'text-amber-400',
      info: 'text-sky-400',
    }[severity];
  }

  border(severity: ToastSeverity): string {
    return {
      success: 'border-primary-500/30',
      error: 'border-red-500/30',
      warn: 'border-amber-500/30',
      info: 'border-sky-500/30',
    }[severity];
  }
}
