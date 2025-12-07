import { Component, computed, EventEmitter, inject, input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { WorkoutService } from '../../services/workout.service';
import { ExerciseType } from '../../shared/types/Exercise';
import { IRemoveSet, IUpdateSet, SetType } from '../../shared/types/Set';
import { Workout } from '../../shared/types/Workout';

@Component({
  templateUrl: './set-input.html',
  selector: 'set-input',
  imports: [FormsModule, ButtonModule, InputNumberModule],
})
export class SetInput {
  @Output() updateSet = new EventEmitter<IUpdateSet>();
  @Output() removeSet = new EventEmitter<IRemoveSet>();

  set = input.required<SetType>();
  exercise = input.required<ExerciseType>();
  workoutId = input.required<Workout['_id']>();
  index = input.required<number>();

  workoutService = inject(WorkoutService);

  previousMatchingSet = computed<SetType | undefined>(() => {
    const workout = this.workoutService
      .workouts()
      .find(
        (w) =>
          w._id !== this.workoutId() && w.exercises.find((e) => e.name === this.exercise().name),
      );

    if (!workout) return;

    const exercise = workout.exercises.find((e) => e.name === this.exercise().name);

    if (!exercise) return;

    const set = exercise.sets[this.index()];

    if (!set) return;

    return set;
  });

  onUpdateSet(id: string, index: number, type: IUpdateSet['type'], value: number) {
    this.updateSet.emit({ id, index, type, value });
  }

  onRemoveSet(id: string, index: number) {
    this.removeSet.emit({ id, index });
  }
}
