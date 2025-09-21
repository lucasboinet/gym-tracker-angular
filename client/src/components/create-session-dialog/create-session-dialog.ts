import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SessionService } from '../../services/sessions.service';
import { Session } from '../../shared/types/Session';
import { AddExerciseDialog } from '../add-exercise-dialog/add-exercise-dialog';

@Component({
  templateUrl: './create-session-dialog.html',
  selector: 'create-session-dialog',
  imports: [DialogModule, Button, AddExerciseDialog, FormsModule],
})
export class CreateSessionDialog {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  private sessionService = inject(SessionService);
  private messageService = inject(MessageService);

  showAddExercise = false;

  name: Session['name'] = '';
  exercises: Session['exercises'] = [];

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
