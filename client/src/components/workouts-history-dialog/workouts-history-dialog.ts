import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { UiDialog } from '../ui/dialog';
import { ToastService } from '../../services/toast.service';
import { WorkoutService } from '../../services/workout.service';
import { Workout } from '../../shared/types/Workout';

@Component({
  selector: 'workouts-history-dialog',
  imports: [CommonModule, UiDialog],
  templateUrl: './workouts-history-dialog.html',
})
export class WorkoutsHistory {
  @Input() workouts: Workout[] = [];
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() workoutDelete = new EventEmitter<string>();

  private workoutService = inject(WorkoutService);
  private toast = inject(ToastService);

  handleVisibleChange(value: boolean) {
    this.openChange.emit(value);
  }

  removeWorkout(workoutId: string) {
    this.workoutService.deleteWorkout(workoutId).subscribe({
      next: () => {
        this.workoutService.workouts.set(
          this.workoutService.workouts().filter((w) => w._id !== workoutId),
        );

        this.workoutDelete.emit(workoutId);

        this.toast.add({
          severity: 'success',
          summary: 'Workout',
          detail: `Workout deleted successfully`,
        });
      },
      error: () => {
        this.toast.add({
          severity: 'error',
          summary: 'Workout',
          detail: `Something wrong happened while deleting this workout`,
        });
      },
    });
  }
}
