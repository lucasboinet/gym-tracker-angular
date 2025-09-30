import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { IosNumberPickerComponent } from '../number-picker/number-picker';

@Component({
  templateUrl: './no-active-workout.html',
  selector: 'no-active-workout',
  imports: [InputNumberModule, ButtonModule, FormsModule, IosNumberPickerComponent],
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
