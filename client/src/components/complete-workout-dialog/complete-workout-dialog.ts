import { Component, computed, EventEmitter, input, Input, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { getRangeDuration } from '../../shared/dates';
import { Workout, WorkoutInsights } from '../../shared/types/Workout';

@Component({
  templateUrl: './complete-workout-dialog.html',
  selector: 'complete-workout-dialog',
  imports: [Dialog],
})
export class CompleteWorkoutDialog {
  @Output() openChange = new EventEmitter<boolean>();

  @Input() open = false;

  insights = input.required<WorkoutInsights>();
  workout = input.required<Workout>();

  workoutDuration = computed(() =>
    getRangeDuration(this.workout().createdAt, this.workout().updatedAt!),
  );

  OnOpenChange(value: boolean) {
    this.openChange.emit(value);
  }
}
