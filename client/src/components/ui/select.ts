import { Component, computed, ElementRef, HostListener, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Custom single-select dropdown for object options. Two-way `value`.
 * Replaces p-select.
 */
@Component({
  selector: 'ui-select',
  imports: [FormsModule],
  template: `
    <div class="relative" [class]="styleClass()">
      <button
        type="button"
        class="flex w-full items-center justify-between gap-2 rounded-xl border border-surface-700 bg-surface-900 px-3.5 py-2.5 text-sm text-left cursor-pointer transition-colors hover:border-surface-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
        (click)="toggle()"
      >
        <span [class]="value() ? 'text-surface-50 truncate' : 'text-surface-500 truncate'">
          {{ value() ? label(value()) : placeholder() }}
        </span>
        <span class="flex items-center gap-1 shrink-0">
          @if (showClear() && value()) {
            <i
              class="pi pi-times text-xs text-surface-500 hover:text-surface-200"
              (click)="clear($event)"
            ></i>
          }
          <i class="pi pi-chevron-down text-xs text-surface-400" [class.rotate-180]="open()"></i>
        </span>
      </button>

      @if (open()) {
        <div
          class="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-surface-700 bg-surface-850 shadow-2xl"
        >
          @if (filter()) {
            <div class="border-b border-surface-800 p-2">
              <input
                type="text"
                [(ngModel)]="query"
                placeholder="Search…"
                class="field !py-2 text-sm"
                (click)="$event.stopPropagation()"
              />
            </div>
          }
          <div class="max-h-60 overflow-y-auto py-1">
            @for (option of filtered(); track $index) {
              <button
                type="button"
                class="flex w-full items-center justify-between px-3.5 py-2 text-sm text-left cursor-pointer transition-colors hover:bg-surface-800"
                [class]="isSelected(option) ? 'text-primary-400 bg-surface-800' : 'text-surface-200'"
                (click)="select(option)"
              >
                <span class="truncate">{{ label(option) }}</span>
                @if (isSelected(option)) {
                  <i class="pi pi-check text-xs"></i>
                }
              </button>
            } @empty {
              <div class="px-3.5 py-3 text-sm text-surface-500">No results</div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class UiSelect {
  value = model<any>(undefined);
  options = input<any[]>([]);
  optionLabel = input<string>('');
  placeholder = input<string>('Select');
  filter = input<boolean>(false);
  showClear = input<boolean>(false);
  styleClass = input<string>('');

  open = signal(false);
  query = signal('');

  private host = inject(ElementRef);

  filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.options();
    return this.options().filter((o) => this.label(o).toLowerCase().includes(q));
  });

  label(option: any): string {
    if (option === null || option === undefined) return '';
    const key = this.optionLabel();
    return key ? String(option[key]) : String(option);
  }

  isSelected(option: any): boolean {
    return this.value() === option;
  }

  toggle() {
    this.open.update((v) => !v);
    if (!this.open()) this.query.set('');
  }

  select(option: any) {
    this.value.set(option);
    this.open.set(false);
    this.query.set('');
  }

  clear(event: MouseEvent) {
    event.stopPropagation();
    this.value.set(undefined);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.host.nativeElement.contains(event.target)) {
      this.open.set(false);
      this.query.set('');
    }
  }
}
