import { Component, computed, EventEmitter, inject, input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { RestTimerService } from '../../services/rest-timer.service';
import { WorkoutService } from '../../services/workout.service';
import { isCompound } from '../../shared/exercises';
import { SetSuggestion, suggestNextSet } from '../../shared/progression';
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
  fatigued = input<boolean>(false);

  workoutService = inject(WorkoutService);
  restTimer = inject(RestTimerService);

  suggestion = computed<SetSuggestion | null>(() => {
    const last = this.previousMatchingSet();
    if (!last) return null;
    return suggestNextSet(last, {
      isCompound: isCompound(this.exercise().name),
      fatigued: this.fatigued(),
    });
  });

  applySuggestion() {
    const suggestion = this.suggestion();
    if (!suggestion) return;
    const id = this.exercise()._id!;
    this.onUpdateSet(id, this.index(), 'weight', suggestion.weight);
    this.onUpdateSet(id, this.index(), 'reps', suggestion.reps);
  }

  startRest() {
    this.restTimer.start(this.exercise().restTime ?? 0, this.exercise().name);
  }

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
