import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuBar } from '../components/menu/menu';
import { UiConfirmDialog } from '../components/ui/confirm-dialog';
import { UiToast } from '../components/ui/toast';
import { UpdateBannerComponent } from '../components/update-banner/update-banner';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { WorkoutService } from '../services/workout.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UiToast, UiConfirmDialog, UpdateBannerComponent, MenuBar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  workouts = [];

  workoutService = inject(WorkoutService);
  authService = inject(AuthService);
  toast = inject(ToastService);
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
      this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load workouts' });
    }
  }
}
