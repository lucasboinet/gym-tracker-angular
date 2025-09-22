import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SessionService } from '../../services/sessions.service';
import { Session } from '../../shared/types/Session';
import { AddExerciseDialog } from '../add-exercise-dialog/add-exercise-dialog';

@Component({
  templateUrl: './session-dialog.html',
  selector: 'session-dialog',
  imports: [DialogModule, Button, AddExerciseDialog, FormsModule],
})
export class SessionDialog {
  @Input({ required: false }) title = 'Create Session';
  @Input({ required: false }) action: 'create' | 'edit' = 'create';
  @Input({ required: false }) buttonLabel = 'Create';
  @Input({ required: false }) session: Session | undefined = undefined;
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  private sessionService = inject(SessionService);
  private messageService = inject(MessageService);

  showAddExercise = false;

  name: Session['name'] = '';
  exercises: Session['exercises'] = [];

  handleOnShow() {
    if (this.action === 'edit' && this.session) {
      this.name = this.session.name;
      this.exercises = this.session.exercises;
    }
  }

  onOpenChange(value: boolean) {
    this.openChange.emit(value);
  }

  onExerciseAdded(value: string) {
    this.exercises = [...this.exercises, { name: value, sets: [{ reps: 0, weight: 0 }] }];
    this.showAddExercise = false;
  }

  cancelSessionCreation() {
    this.name = '';
    this.exercises = [];
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
      this.messageService.add({
        severity: 'warn',
        summary: "Can't update session",
        detail: 'Enter a session name to continue',
        life: 3000,
      });
      return;
    }

    if (this.exercises.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: "Can't update session",
        detail: 'Add at least one exercise to continue',
        life: 3000,
      });
      return;
    }

    this.sessionService
      .updateSession({
        _id: this.session!._id,
        name: this.name,
        exercises: this.exercises,
      })
      .subscribe({
        next: (data) => {
          const updatedSessions = this.sessionService
            .sessions()
            .map((s) => (s._id === data._id ? data : s));
          this.sessionService.sessions.set(updatedSessions);
          this.cancelSessionCreation();
          this.messageService.add({
            severity: 'success',
            summary: 'Session updated',
            detail: `Session "${data.name}" updated successfully`,
            life: 3000,
          });
        },
        error: (err) => console.error('Error updating session:', err),
      });
  }

  createSession() {
    if (!this.name) {
      this.messageService.add({
        severity: 'warn',
        summary: "Can't create session",
        detail: 'Enter a session name to continue',
        life: 3000,
      });
      return;
    }

    if (this.exercises.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: "Can't create session",
        detail: 'Add at least one exercise to continue',
        life: 3000,
      });
      return;
    }

    this.sessionService
      .createSession({
        name: this.name,
        exercises: this.exercises,
      })
      .subscribe({
        next: (data) => {
          this.sessionService.sessions.set([...this.sessionService.sessions(), data]);
          this.cancelSessionCreation();
          this.messageService.add({
            severity: 'success',
            summary: 'Session created',
            detail: `Session "${data.name}" created successfully`,
            life: 3000,
          });
        },
        error: (err) => console.error('Error creating session:', err),
      });
  }
}
