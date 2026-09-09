import { Component, computed, ElementRef, HostListener, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../services/sessions.service';
import { ToastService } from '../../services/toast.service';
import { WorkoutService } from '../../services/workout.service';
import { getContrastColor } from '../../shared/colors';
import { durationFromDate } from '../../shared/dates';
import { Session } from '../../shared/types/Session';
import { Workout } from '../../shared/types/Workout';
import { SessionDialog } from '../session-dialog/session-dialog';

@Component({
  templateUrl: './session-card.html',
  selector: 'session-card',
  imports: [SessionDialog],
})
export class SessionCard {
  session = input.required<Session>();
  durationFromCreatedAt = computed(() => durationFromDate(this.session().createdAt));
  showEditDialog = false;
  menuOpen = signal(false);

  contrastColor = computed(() => getContrastColor(this.session().color, 60));

  private workoutService = inject(WorkoutService);
  private sessionService = inject(SessionService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private host = inject(ElementRef);

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuOpen.update((v) => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.host.nativeElement.contains(event.target)) {
      this.menuOpen.set(false);
    }
  }

  editSession() {
    this.menuOpen.set(false);
    this.showEditDialog = true;
  }

  onStartSession() {
    if (this.workoutService.currentWorkout()) {
      this.toast.add({
        severity: 'warn',
        summary: "Can't start session",
        detail: 'You already have an active workout running.',
      });
      return;
    }

    const workout: Partial<Workout> = {
      startTime: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      exercises: this.session().exercises,
      sessionId: this.session()._id,
    };

    this.workoutService.createWorkout(workout).subscribe({
      next: (data) => {
        this.workoutService.currentWorkout.set(data);
        this.workoutService.exercises.set(data.exercises);
        this.router.navigate(['/']);
      },
    });
  }

  onDeleteSession() {
    this.menuOpen.set(false);
    this.sessionService.deleteSession(this.session()._id!).subscribe({
      next: () => {
        this.sessionService.sessions.set([
          ...this.sessionService.sessions().filter((s) => s._id !== this.session()._id),
        ]);

        this.toast.add({
          severity: 'success',
          summary: 'Session deleted',
          detail: 'The session has been deleted successfully.',
        });
      },
    });
  }
}
