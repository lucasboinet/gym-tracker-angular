import { Component } from "@angular/core";
import { Output, EventEmitter } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { InputNumberModule } from "primeng/inputnumber";

@Component({
  templateUrl: './no-active-workout.html',
  selector: 'no-active-workout',
  imports: [InputNumberModule, ButtonModule, FormsModule]
})
export class NoActiveWorkout {
  @Output() startWorkout = new EventEmitter<void>();


  onStartWorkout() {
    this.startWorkout.emit();
  }
}