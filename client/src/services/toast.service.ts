import { Injectable, signal } from '@angular/core';

export type ToastSeverity = 'success' | 'error' | 'warn' | 'info';

export interface ToastMessage {
  id: number;
  severity: ToastSeverity;
  summary: string;
  detail?: string;
  life: number;
}

export interface ToastInput {
  severity: string;
  summary: string;
  detail?: string;
  life?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private counter = 0;

  add(input: ToastInput) {
    const id = ++this.counter;
    const life = input.life ?? 3000;
    const message: ToastMessage = {
      id,
      severity: (input.severity as ToastSeverity) ?? 'info',
      summary: input.summary,
      detail: input.detail,
      life,
    };
    this.messages.update((list) => [...list, message]);
    if (life > 0) {
      setTimeout(() => this.remove(id), life);
    }
  }

  remove(id: number) {
    this.messages.update((list) => list.filter((m) => m.id !== id));
  }
}
