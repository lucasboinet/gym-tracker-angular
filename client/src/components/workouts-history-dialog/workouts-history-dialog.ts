import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { Workout } from '../../shared/types/Workout';

@Component({
  selector: 'workouts-history-dialog',
  imports: [CommonModule, DialogModule],
  templateUrl: './workouts-history-dialog.html'
})
export class WorkoutsHistory {
  @Input() workouts: Workout[] = [];
  @Input() open = false;
}