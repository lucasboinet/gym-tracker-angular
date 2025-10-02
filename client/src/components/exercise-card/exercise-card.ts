import { Component, EventEmitter, input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ExerciseType } from '../../shared/types/Exercise';
import { IRemoveSet, IUpdateSet } from '../../shared/types/Set';
import { Workout } from '../../shared/types/Workout';
import { SetInput } from '../set-input/set-input';

@Component({
  templateUrl: './exercise-card.html',
  selector: 'exercise-card',
  imports: [FormsModule, ButtonModule, InputNumberModule, SetInput],
})
export class ExerciseCard {
  @Output() removeExercise = new EventEmitter<string>();
  @Output() addSet = new EventEmitter<string>();
  @Output() updateSet = new EventEmitter<IUpdateSet>();
  @Output() removeSet = new EventEmitter<IRemoveSet>();

  exercise = input.required<ExerciseType>();
  workoutId = input.required<Workout['_id']>();

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
