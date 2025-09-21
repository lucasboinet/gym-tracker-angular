import { Component, computed, inject, input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContextMenuService, MenuItem, MessageService } from 'primeng/api';
import { ContextMenuModule } from 'primeng/contextmenu';
import { SessionService } from '../../services/sessions.service';
import { WorkoutService } from '../../services/workout.service';
import { durationFromDate } from '../../shared/dates';
import { Session } from '../../shared/types/Session';
import { Workout } from '../../shared/types/Workout';

@Component({
  templateUrl: './session-card.html',
  selector: 'session-card',
  imports: [ContextMenuModule],
  providers: [ContextMenuService],
})
export class SessionCard implements OnInit {
  session = input.required<Session>();
  durationFromCreatedAt = computed(() => durationFromDate(this.session().createdAt));
  contextMenuItems: MenuItem[] = [];

  private workoutService = inject(WorkoutService);
  private sessionService = inject(SessionService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  ngOnInit(): void {
    this.contextMenuItems = [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => {
          console.log('Edit session');
        },
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => {
          this.onDeleteSession();
        },
      },
    ];
  }

  onStartSession() {
    const workout: Partial<Workout> = {
      startTime: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      exercises: this.session().exercises,
    };

    this.workoutService.createWorkout(workout).subscribe({
      next: (data) => {
        console.log(data);
        this.workoutService.currentWorkout.set(data);
        this.workoutService.exercises.set(data.exercises);
        this.router.navigate(['/']);
      },
    });
  }

  onDeleteSession() {
    this.sessionService.deleteSession(this.session()._id!).subscribe({
      next: () => {
        this.sessionService.sessions.set([
          ...this.sessionService.sessions().filter((s) => s._id !== this.session()._id),
        ]);

        this.messageService.add({
          severity: 'success',
          summary: 'Session deleted',
          detail: 'The session has been deleted successfully.',
          life: 3000,
        });
      },
    });
  }
}
