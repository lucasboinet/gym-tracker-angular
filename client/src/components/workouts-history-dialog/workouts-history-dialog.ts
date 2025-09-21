import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Workout } from '../../shared/types/Workout';

@Component({
  selector: 'workouts-history-dialog',
  imports: [CommonModule, DialogModule],
  templateUrl: './workouts-history-dialog.html',
})
export class WorkoutsHistory {
  @Input() workouts: Workout[] = [];
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  handleVisibleChange(value: boolean) {
    this.openChange.emit(value);
  }
}
