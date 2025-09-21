import { Component, Input } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { AddExerciseDialog } from '../add-exercise-dialog/add-exercise-dialog';
import { Session } from '../../shared/types/Session';
import { FormsModule } from '@angular/forms';

@Component({
  templateUrl: './create-session-dialog.html',
  selector: 'create-session-dialog',
  imports: [DialogModule, Button, AddExerciseDialog, FormsModule],
})
export class CreateSessionDialog {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

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
}
