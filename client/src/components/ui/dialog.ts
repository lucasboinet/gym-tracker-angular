import { DOCUMENT } from '@angular/common';
import {
  Component,
  effect,
  EventEmitter,
  HostListener,
  inject,
  input,
  model,
  Output,
} from '@angular/core';

/**
 * Lightweight modal dialog. Two-way `visible`. Emits `show` on open.
 * Default renders a titled panel; set `bare` for a fully custom body.
 */
@Component({
  selector: 'ui-dialog',
  template: `
    @if (visible()) {
      <div
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        (click)="onBackdrop()"
      >
        @if (bare()) {
          <div class="w-full max-w-2xl" [style.max-width]="maxWidth()" (click)="$event.stopPropagation()">
            <ng-content />
          </div>
        } @else {
          <div
            class="ui-dialog-panel flex w-full flex-col overflow-hidden rounded-2xl border border-surface-700 bg-surface-900 shadow-2xl"
            [class]="panelClass()"
            [style.max-width]="maxWidth()"
            (click)="$event.stopPropagation()"
          >
            @if (header() || closable()) {
              <div class="flex items-center justify-between gap-3 border-b border-surface-800 px-5 py-4">
                <h3 class="text-base font-semibold text-surface-50">{{ header() }}</h3>
                @if (closable()) {
                  <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-800 hover:text-surface-100 cursor-pointer transition-colors"
                    (click)="close()"
                  >
                    <i class="pi pi-times text-sm"></i>
                  </button>
                }
              </div>
            }
            <div class="flex-1 overflow-y-auto p-5" [class]="contentClass()">
              <ng-content />
            </div>
            <ng-content select="[dialogFooter]" />
          </div>
        }
      </div>
    }
  `,
})
export class UiDialog {
  visible = model<boolean>(false);
  header = input<string>('');
  closable = input<boolean>(true);
  dismissable = input<boolean>(true);
  bare = input<boolean>(false);
  maxWidth = input<string>('32rem');
  panelClass = input<string>('');
  contentClass = input<string>('');

  @Output() show = new EventEmitter<void>();

  private document = inject(DOCUMENT);
  private wasVisible = false;

  constructor() {
    effect(() => {
      const v = this.visible();
      if (v && !this.wasVisible) this.show.emit();
      this.wasVisible = v;
      // Lock body scroll while open.
      if (this.document?.body) {
        this.document.body.style.overflow = v ? 'hidden' : '';
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.visible() && this.dismissable()) this.close();
  }

  onBackdrop() {
    if (this.dismissable()) this.close();
  }

  close() {
    this.visible.set(false);
  }
}
