import { Component, Input } from "@angular/core";
import { Output, EventEmitter } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { InputNumberModule } from "primeng/inputnumber";
import { SetType } from "../../shared/types/Set";
import { ExerciseType } from "../../shared/types/Exercise";

@Component({
  templateUrl: './set-input.html',
  selector: 'set-input',
  imports: [InputNumberModule, ButtonModule, FormsModule]
})
export class SetInput {
  @Output() updateSet = new EventEmitter<{ exerciseId: string, index: number, type: 'reps' | 'weight', value: number }>();
  @Output() removeSet = new EventEmitter<{ exerciseId: string, index: number }>();

  @Input() exercise!: ExerciseType;
  @Input() set!: SetType;
  @Input() index!: number;

  updateSetTimer?: NodeJS.Timeout = undefined;

  onRemoveSet(exerciseId: string, index: number) {
    this.removeSet.emit({ exerciseId, index });
  }

  onUpdateSet(exerciseId: string, index: number, type: 'reps' | 'weight', value: number) {
    if (this.updateSetTimer) {
      clearTimeout(this.updateSetTimer);
    }

    this.updateSetTimer = setTimeout(() => {
      this.updateSet.emit({ exerciseId, index, type, value });
    }, 500)
  }
}