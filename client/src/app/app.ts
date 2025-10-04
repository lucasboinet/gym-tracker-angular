import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MenuBar } from '../components/menu/menu';
import { UpdateBannerComponent } from '../components/update-banner/update-banner';
import { AuthService } from '../services/auth.service';
import { WorkoutService } from '../services/workout.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmDialogModule, ToastModule, UpdateBannerComponent, MenuBar],
  providers: [MessageService, ConfirmationService],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  workouts = [];

  workoutService = inject(WorkoutService);
  authService = inject(AuthService);
  messageService = inject(MessageService);
  cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadWorkouts();
  }

  async loadWorkouts() {
    try {
      this.workoutService.getWorkouts().subscribe({
        next: (data) => {
          this.workoutService.workouts.set(
            data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
          );
          this.cdr.markForCheck();
        },
      });
    } catch {
      this.showToast('error', 'Error', 'Failed to load workouts');
    }
  }

  private showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 3000,
    });
  }
}
