import { Component, EventEmitter, Output } from '@angular/core';
import { UiButton } from '../ui/button';

@Component({
  templateUrl: './no-active-workout.html',
  selector: 'no-active-workout',
  imports: [UiButton],
})
export class NoActiveWorkout {
  @Output() startWorkout = new EventEmitter<void>();

  onStartWorkout() {
    this.startWorkout.emit();
  }
}
