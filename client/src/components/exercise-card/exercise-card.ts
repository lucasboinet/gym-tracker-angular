import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component, computed, EventEmitter, inject, input, Output } from '@angular/core';
import { UiButton } from '../ui/button';
import { WorkoutService } from '../../services/workout.service';
import { ExerciseType } from '../../shared/types/Exercise';
import { IRemoveSet, IUpdateSet } from '../../shared/types/Set';
import { Workout } from '../../shared/types/Workout';
import { SetInput } from '../set-input/set-input';

@Component({
  templateUrl: './exercise-card.html',
  selector: 'exercise-card',
  imports: [UiButton, SetInput, DragDropModule],
})
export class ExerciseCard {
  @Output() removeExercise = new EventEmitter<string>();
  @Output() addSet = new EventEmitter<string>();
  @Output() updateSet = new EventEmitter<IUpdateSet>();
  @Output() removeSet = new EventEmitter<IRemoveSet>();
  @Output() updateExercise = new EventEmitter<ExerciseType>();

  exercise = input.required<ExerciseType>();
  workoutId = input.required<Workout['_id']>();

  workoutService = inject(WorkoutService);

  previousMatchingExercise = computed<ExerciseType | undefined>(() => {
    const workout = this.workoutService
      .workouts()
      .find(
        (w) =>
          w._id !== this.workoutId() && w.exercises.find((e) => e.name === this.exercise().name),
      );

    if (!workout) return;

    return workout.exercises.find((e) => e.name === this.exercise().name && e.notes !== undefined);
  });

  /**
   * True when this exercise's total volume dropped >5% between its two most
   * recent completed workouts — used to recommend holding instead of adding load.
   */
  fatigued = computed<boolean>(() => {
    const name = this.exercise().name;
    const volumes = this.workoutService
      .workouts()
      .filter((w) => w._id !== this.workoutId() && w.exercises.some((e) => e.name === name))
      .map((w) => {
        const ex = w.exercises.find((e) => e.name === name);
        return ex ? ex.sets.reduce((sum, s) => sum + s.reps * s.weight, 0) : 0;
      });

    if (volumes.length < 2) return false;

    // workouts() is sorted newest-first, so volumes[0] is the latest.
    const [latest, prior] = volumes;
    if (!prior) return false;
    return latest < prior * 0.95;
  });

  onUpdateExerciseNotes(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    this.updateExercise.emit({ ...this.exercise(), notes: el.value });
  }

  onUpdateSet(id: string, index: number, type: IUpdateSet['type'], value: number) {
    this.updateSet.emit({ id, index, type, value });
  }

  onRemoveExercise(id: string) {
    this.removeExercise.emit(id);
  }

  onRemoveSet(id: string, index: number) {
    this.removeSet.emit({ id, index });
  }

  onAddSet(id: string) {
    this.addSet.emit(id);
  }
}
