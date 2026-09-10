import { Component, computed, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiButton } from '../ui/button';
import { UiDialog } from '../ui/dialog';
import { COMMON_EXERCISES } from '../../shared/data';
import { WorkoutService } from '../../services/workout.service';

@Component({
  templateUrl: './add-exercise-dialog.html',
  selector: 'add-exercise-dialog',
  imports: [FormsModule, UiDialog, UiButton],
})
export class AddExerciseDialog {
  @Output() exerciseAdded = new EventEmitter<string>();
  @Output() exerciseCancel = new EventEmitter<void>();
  @Output() openChange = new EventEmitter<boolean>();

  @Input() open = false;

  commonExercises = COMMON_EXERCISES;
  query = signal('');

  private workoutService = inject(WorkoutService);

  /** Distinct exercise names the user has trained before, plus the common list. */
  private allNames = computed<string[]>(() => {
    const fromHistory = this.workoutService
      .workouts()
      .flatMap((w) => w.exercises.map((e) => e.name));
    const seen = new Set<string>();
    const result: string[] = [];
    for (const name of [...fromHistory, ...COMMON_EXERCISES]) {
      const key = name.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(name.trim());
    }
    return result;
  });

  /** Names matching the current query (empty query → no suggestions shown). */
  suggestions = computed<string[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return [];
    return this.allNames()
      .filter((name) => name.toLowerCase().includes(q) && name.toLowerCase() !== q)
      .slice(0, 6);
  });

  OnOpenChange(value: boolean) {
    this.openChange.emit(value);
  }

  onExerciseAdded(value: string) {
    if (!value?.trim()) return;
    this.exerciseAdded.emit(value.trim());
    this.query.set('');
  }

  onAddExerciseCancel() {
    this.exerciseCancel.emit();
    this.query.set('');
    this.OnOpenChange(false);
  }
}
