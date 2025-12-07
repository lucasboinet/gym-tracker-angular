import { Component, EventEmitter, input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ExerciseType } from '../../shared/types/Exercise';
import { IRemoveSet, IUpdateSet } from '../../shared/types/Set';
import { Workout } from '../../shared/types/Workout';
import { SetInput } from '../set-input/set-input';

@Component({
  templateUrl: './exercise-card.html',
  selector: 'exercise-card',
  imports: [FormsModule, ButtonModule, InputNumberModule, SetInput, TextareaModule],
})
export class ExerciseCard {
  @Output() removeExercise = new EventEmitter<string>();
  @Output() addSet = new EventEmitter<string>();
  @Output() updateSet = new EventEmitter<IUpdateSet>();
  @Output() removeSet = new EventEmitter<IRemoveSet>();
  @Output() updateExercise = new EventEmitter<ExerciseType>();

  exercise = input.required<ExerciseType>();
  workoutId = input.required<Workout['_id']>();

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
