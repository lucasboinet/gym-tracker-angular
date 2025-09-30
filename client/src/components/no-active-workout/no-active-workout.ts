import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  templateUrl: './no-active-workout.html',
  selector: 'no-active-workout',
  imports: [ButtonModule, FormsModule],
})
export class NoActiveWorkout {
  @Output() startWorkout = new EventEmitter<void>();

  onStartWorkout() {
    this.startWorkout.emit();
  }

  onNumberPickerChange(data: number) {
    console.log(data);
  }
}
