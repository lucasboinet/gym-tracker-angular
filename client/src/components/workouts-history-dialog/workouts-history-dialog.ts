import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { WorkoutService } from '../../services/workout.service';
import { Workout } from '../../shared/types/Workout';

@Component({
  selector: 'workouts-history-dialog',
  imports: [CommonModule, DialogModule],
  providers: [MessageService],
  templateUrl: './workouts-history-dialog.html',
})
export class WorkoutsHistory {
  @Input() workouts: Workout[] = [];
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  private workoutService = inject(WorkoutService);
  private messageService = inject(MessageService);

  handleVisibleChange(value: boolean) {
    this.openChange.emit(value);
  }

  removeWorkout(workoutId: string) {
    this.workoutService.deleteWorkout(workoutId).subscribe({
      next: () => {
        this.workoutService.workouts.set(
          this.workoutService.workouts().filter((w) => w._id !== workoutId),
        );

        this.messageService.add({
          severity: 'success',
          summary: 'Workout',
          detail: `Workout deleted successfully`,
          life: 3000,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Workout',
          detail: `Something wrong happened while deleting this workout`,
          life: 3000,
        });
      },
    });
  }
}
