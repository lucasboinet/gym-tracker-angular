import { Component, computed, EventEmitter, input, Output } from '@angular/core';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="classes()"
      (click)="handleClick($event)"
    >
      @if (loading()) {
        <i class="pi pi-spinner pi-spin"></i>
      } @else if (icon() && iconPos() === 'left') {
        <i [class]="icon()"></i>
      }
      @if (label()) {
        <span>{{ label() }}</span>
      }
      <ng-content />
      @if (!loading() && icon() && iconPos() === 'right') {
        <i [class]="icon()"></i>
      }
    </button>
  `,
})
export class UiButton {
  label = input<string>();
  icon = input<string>();
  iconPos = input<'left' | 'right'>('left');
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  full = input<boolean>(false);
  type = input<'button' | 'submit'>('button');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  styleClass = input<string>('');

  @Output() onClick = new EventEmitter<MouseEvent>();

  private base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl cursor-pointer ' +
    'transition-colors duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 whitespace-nowrap';

  private sizes: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-5 py-3',
  };

  private variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary-500 text-surface-950 hover:bg-primary-400 shadow-sm shadow-primary-500/20',
    secondary: 'bg-surface-800 text-surface-100 hover:bg-surface-700 border border-surface-700',
    outline: 'border border-surface-700 text-surface-200 hover:bg-surface-800 hover:border-surface-600',
    ghost: 'text-surface-300 hover:bg-surface-800 hover:text-surface-100',
    danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30',
    success: 'bg-primary-500 text-surface-950 hover:bg-primary-400',
  };

  classes = computed(() =>
    [
      this.base,
      this.sizes[this.size()],
      this.variants[this.variant()],
      this.full() ? 'w-full' : '',
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' '),
  );

  handleClick(event: MouseEvent) {
    if (this.disabled() || this.loading()) return;
    this.onClick.emit(event);
  }
}
