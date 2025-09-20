import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { UpdateBannerComponent } from "../components/update-banner/update-banner";
import { MenuBar } from "../components/menu/menu";
import { WorkoutsHistory } from "../components/workouts-history-dialog/workouts-history-dialog";
import { WorkoutService } from '../services/workout.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ConfirmDialogModule,
    ToastModule,
    UpdateBannerComponent,
    MenuBar,
    WorkoutsHistory
],
  providers: [MessageService, ConfirmationService],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  showWorkoutHistory = false;
  workouts = [];

  constructor(
    public workoutService: WorkoutService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadWorkouts();
  }

  async loadWorkouts() {
    try {
      this.workoutService.getWorkouts().subscribe({
        next: (data) => {
          this.workoutService.workouts.set(data.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
          this.cdr.markForCheck();
        }
      });
    } catch (error) {
      this.showToast('error', 'Error', 'Failed to load workouts');
    }
  }

  private showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 3000
    });
  }
}
