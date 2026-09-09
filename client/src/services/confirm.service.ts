import { Injectable, signal } from '@angular/core';
import { ButtonVariant } from '../components/ui/button';

export interface ConfirmOptions {
  message: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptVariant?: ButtonVariant;
  accept?: () => void;
  reject?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly current = signal<ConfirmOptions | null>(null);

  confirm(options: ConfirmOptions) {
    this.current.set(options);
  }

  accept() {
    this.current()?.accept?.();
    this.current.set(null);
  }

  reject() {
    this.current()?.reject?.();
    this.current.set(null);
  }
}
