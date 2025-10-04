import { ChangeDetectorRef, Component, inject } from '@angular/core';
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
export class App {
  workouts = [];

  workoutService = inject(WorkoutService);
  authService = inject(AuthService);
  messageService = inject(MessageService);
  cdr = inject(ChangeDetectorRef);
}
