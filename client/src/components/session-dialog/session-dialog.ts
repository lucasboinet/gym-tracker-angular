import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiButton } from '../ui/button';
import { UiDialog } from '../ui/dialog';
import { UiNumber } from '../ui/number-stepper';
import { SessionService } from '../../services/sessions.service';
import { ToastService } from '../../services/toast.service';
import { Session } from '../../shared/types/Session';
import { AddExerciseDialog } from '../add-exercise-dialog/add-exercise-dialog';

@Component({
  templateUrl: './session-dialog.html',
  selector: 'session-dialog',
  imports: [UiDialog, UiButton, UiNumber, AddExerciseDialog, FormsModule],
})
export class SessionDialog {
  @Input({ required: false }) title = 'Create Session';
  @Input({ required: false }) action: 'create' | 'edit' = 'create';
  @Input({ required: false }) buttonLabel = 'Create';
  @Input({ required: false }) session: Session | undefined = undefined;
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  private sessionService = inject(SessionService);
  private toast = inject(ToastService);

  showAddExercise = false;

  name: Session['name'] = '';
  color: Session['color'] = '#a4d43b';
  exercises: Session['exercises'] = [];

  handleOnShow() {
    if (this.action === 'edit' && this.session) {
      this.name = this.session.name;
      this.exercises = this.session.exercises;
      this.color = this.session.color;
    }
  }

  onOpenChange(value: boolean) {
    this.openChange.emit(value);
  }

  onExerciseAdded(value: string) {
    this.exercises = [
      ...this.exercises,
      { name: value, sets: [{ reps: 0, weight: 0 }], restTime: 90 },
    ];
    this.showAddExercise = false;
  }

  updateRestTime(index: number, value: number) {
    this.exercises = this.exercises.map((exercise, i) =>
      i === index ? { ...exercise, restTime: Math.max(0, value) } : exercise,
    );
  }

  cancelSessionCreation() {
    this.name = '';
    this.exercises = [];
    this.color = '#a4d43b';
    this.onOpenChange(false);
  }

  removeExercise(index: number) {
    this.exercises = this.exercises.filter((_, i) => i !== index);
  }

  handleExecuteAction() {
    if (this.action === 'create') {
      this.createSession();
      return;
    }

    if (this.action === 'edit') {
      this.updateSession();
      return;
    }
  }

  updateSession() {
    if (!this.name) {
      this.toast.add({
        severity: 'warn',
        summary: "Can't update session",
        detail: 'Enter a session name to continue',
      });
      return;
    }

    if (this.exercises.length === 0) {
      this.toast.add({
        severity: 'warn',
        summary: "Can't update session",
        detail: 'Add at least one exercise to continue',
      });
      return;
    }

    this.sessionService
      .updateSession({
        _id: this.session!._id,
        name: this.name,
        exercises: this.exercises,
        color: this.color,
      })
      .subscribe({
        next: (data) => {
          const updatedSessions = this.sessionService
            .sessions()
            .map((s) => (s._id === data._id ? data : s));
          this.sessionService.sessions.set(updatedSessions);
          this.cancelSessionCreation();
          this.toast.add({
            severity: 'success',
            summary: 'Session updated',
            detail: `Session "${data.name}" updated successfully`,
          });
        },
        error: (err) => console.error('Error updating session:', err),
      });
  }

  createSession() {
    if (!this.name) {
      this.toast.add({
        severity: 'warn',
        summary: "Can't create session",
        detail: 'Enter a session name to continue',
      });
      return;
    }

    if (this.exercises.length === 0) {
      this.toast.add({
        severity: 'warn',
        summary: "Can't create session",
        detail: 'Add at least one exercise to continue',
      });
      return;
    }

    this.sessionService
      .createSession({
        name: this.name,
        exercises: this.exercises,
        color: this.color,
      })
      .subscribe({
        next: (data) => {
          this.sessionService.sessions.set([...this.sessionService.sessions(), data]);
          this.cancelSessionCreation();
          this.toast.add({
            severity: 'success',
            summary: 'Session created',
            detail: `Session "${data.name}" created successfully`,
          });
        },
        error: (err) => console.error('Error creating session:', err),
      });
  }
}
