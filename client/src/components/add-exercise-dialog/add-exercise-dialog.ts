import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { COMMON_EXERCISES } from '../../shared/data';

@Component({
  templateUrl: './add-exercise-dialog.html',
  selector: 'add-exercise-dialog',
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule],
})
export class AddExerciseDialog {
  @Output() exerciseAdded = new EventEmitter<string>();
  @Output() exerciseCancel = new EventEmitter<void>();
  @Output() openChange = new EventEmitter<boolean>();

  @Input() open = false;

  commonExercises = COMMON_EXERCISES;
  newExerciseName = '';

  OnOpenChange(value: boolean) {
    this.openChange.emit(value);
  }

  onExerciseAdded(value: string) {
    this.exerciseAdded.emit(value);
    this.newExerciseName = '';
  }

  onAddExerciseCancel() {
    this.exerciseCancel.emit();
    this.newExerciseName = '';
    this.OnOpenChange(false);
  }
}
