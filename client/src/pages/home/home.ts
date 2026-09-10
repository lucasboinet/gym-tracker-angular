import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AddExerciseDialog } from '../../components/add-exercise-dialog/add-exercise-dialog';
import { CompleteWorkoutDialog } from '../../components/complete-workout-dialog/complete-workout-dialog';
import { ExerciseCard } from '../../components/exercise-card/exercise-card';
import { NoActiveWorkout } from '../../components/no-active-workout/no-active-workout';
import { RestTimer } from '../../components/rest-timer/rest-timer';
import { UiButton } from '../../components/ui/button';
import { ConfirmService } from '../../services/confirm.service';
import { PreferencesService } from '../../services/preferences.service';
import { RestTimerService } from '../../services/rest-timer.service';
import { ToastService } from '../../services/toast.service';
import { WorkoutService } from '../../services/workout.service';
import { ExerciseType } from '../../shared/types/Exercise';
import { Workout, WorkoutInsights } from '../../shared/types/Workout';

@Component({
  selector: 'home-page',
  imports: [
    UiButton,
    NoActiveWorkout,
    AddExerciseDialog,
    ExerciseCard,
    CompleteWorkoutDialog,
    RestTimer,
    DragDropModule,
  ],
  templateUrl: './home.html',
})
export class HomePage implements OnInit, OnDestroy {
  showAddExercise = false;
  showCompleteWorkout = false;
  updateCurrentWorkoutTimeout: NodeJS.Timeout | undefined;

  gymService = inject(WorkoutService);
  toast = inject(ToastService);
  confirm = inject(ConfirmService);
  private prefs = inject(PreferencesService);
  private restTimer = inject(RestTimerService);

  completedWorkout = signal<Workout | undefined>(undefined);
  completedWorkoutInsights = signal<WorkoutInsights | undefined>(undefined);

  private now = signal<number>(Date.now());
  private tickId: ReturnType<typeof setInterval> | undefined;

  /** Live elapsed time since the active workout started (H:MM:SS or M:SS). */
  elapsed = computed<string>(() => {
    const workout = this.gymService.currentWorkout();
    if (!workout?.createdAt) return '';
    const start = new Date(workout.createdAt).getTime();
    const total = Math.max(0, Math.floor((this.now() - start) / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const mm = m.toString().padStart(2, '0');
    const ss = s.toString().padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
  });

  ngOnInit() {
    this.loadCurrentWorkout();
    this.loadWorkoutHistory();
    this.tickId = setInterval(() => this.now.set(Date.now()), 1000);
  }

  ngOnDestroy() {
    if (this.tickId !== undefined) clearInterval(this.tickId);
  }

  loadWorkoutHistory() {
    this.gymService.getWorkouts().subscribe({
      next: (workouts) => this.gymService.workouts.set(workouts),
      error: (err) => console.error('Failed to load workout history', err),
    });
  }

  async loadCurrentWorkout() {
    this.gymService.getCurrentWorkout().subscribe({
      next: (data) => {
        if (data) {
          this.gymService.currentWorkout.set(data);
          this.gymService.exercises.set(data.exercises || []);
        }
      },
    });
  }

  async startWorkout() {
    const workout: Workout = {
      createdAt: new Date(),
      startTime: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      exercises: [],
    };

    this.gymService.createWorkout(workout).subscribe({
      next: (data) => {
        this.gymService.currentWorkout.set(data);
        this.gymService.exercises.set([]);
        this.toast.add({
          severity: 'success',
          summary: 'Workout Started',
          detail: 'Ready to crush your goals! 💪',
        });
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to start workout' });
      },
    });
  }

  reorderExercises(event: CdkDragDrop<unknown>) {
    if (event.previousIndex === event.currentIndex) return;
    const exercises = [...this.gymService.exercises()];
    moveItemInArray(exercises, event.previousIndex, event.currentIndex);
    this.gymService.exercises.set(exercises);
    this.saveCurrentExercises();
  }

  addExercise(exerciseName: string) {
    if (!exerciseName?.trim()) return;

    const exercise: ExerciseType = {
      name: exerciseName.trim(),
      sets: [{ reps: 0, weight: 0 }],
      restTime: 90,
    };

    this.gymService.exercises.set([...this.gymService.exercises(), exercise]);
    this.saveCurrentExercises();
    this.showAddExercise = false;
  }

  addSet(exerciseId: string) {
    const exerciseIndex = this.gymService.exercises().findIndex((ex) => ex._id === exerciseId);
    if (exerciseIndex === -1) return;

    const exercise = this.gymService.exercises()[exerciseIndex];
    const lastSet = exercise.sets.slice(-1)[0];
    const newSet = { ...lastSet };

    this.gymService.exercises.set(
      this.gymService.exercises().map((ex) => {
        if (ex._id === exerciseId) {
          return {
            ...ex,
            sets: [...ex.sets, newSet],
          };
        }
        return ex;
      }),
    );

    this.saveCurrentExercises();

    // Adding the next set means the previous one is done — start rest if enabled.
    if (this.prefs.autoRest() && exercise.restTime) {
      this.restTimer.start(exercise.restTime, exercise.name);
    }
  }

  updateSet(exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: number) {
    this.gymService.exercises.set(
      this.gymService.exercises().map((exercise) => {
        if (exercise._id === exerciseId) {
          const updatedSets = [...exercise.sets];
          updatedSets[setIndex] = {
            ...updatedSets[setIndex],
            [field]: Math.max(0, value),
          };
          return { ...exercise, sets: updatedSets };
        }
        return exercise;
      }),
    );
    this.saveCurrentExercises();
  }

  removeSet(exerciseId: string, setIndex: number) {
    this.gymService.exercises.set(
      this.gymService.exercises().map((exercise) => {
        if (exercise._id === exerciseId && exercise.sets.length > 1) {
          const updatedSets = [...exercise.sets.filter((_, index) => index !== setIndex)];
          return { ...exercise, sets: updatedSets };
        }
        return exercise;
      }),
    );
    this.saveCurrentExercises();
  }

  updateExercise(updatedExercise: ExerciseType) {
    this.gymService.exercises.set(
      this.gymService.exercises().map((exercise) => {
        if (exercise._id === updatedExercise._id) {
          return { ...exercise, ...updatedExercise };
        }
        return exercise;
      }),
    );
    this.saveCurrentExercises();
  }

  removeExercise(exerciseId: string) {
    this.confirm.confirm({
      message: 'Remove this exercise from your workout?',
      header: 'Remove Exercise',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remove',
      acceptVariant: 'danger',
      accept: () => {
        this.gymService.exercises.set(
          this.gymService.exercises().filter((exercise) => exercise._id !== exerciseId),
        );
        this.saveCurrentExercises();
      },
    });
  }

  async saveCurrentExercises() {
    if (!this.gymService.currentWorkout()) return;

    if (this.updateCurrentWorkoutTimeout) {
      clearTimeout(this.updateCurrentWorkoutTimeout);
    }

    this.gymService.currentWorkout.set({
      ...this.gymService.currentWorkout()!,
      exercises: this.gymService.exercises(),
    });

    this.updateCurrentWorkoutTimeout = setTimeout(() => {
      this.gymService.saveCurrentWorkout(this.gymService.currentWorkout()!).subscribe({
        next: (data) => {
          this.gymService.currentWorkout.set(data);
          this.gymService.exercises.set(data.exercises);
        },
        error: (err) => console.error(err),
      });
    }, 500);
  }

  async finishWorkout() {
    if (this.gymService.exercises().length === 0) {
      this.toast.add({
        severity: 'warn',
        summary: 'No Exercises',
        detail: 'Add some exercises before finishing!',
      });
      return;
    }

    const hasIncompleteExercises = this.gymService
      .exercises()
      .some((exercise) => exercise.sets.some((set) => set.reps === 0 && set.weight === 0));

    if (hasIncompleteExercises) {
      this.confirm.confirm({
        message: 'Some sets appear incomplete. Finish workout anyway?',
        header: 'Incomplete Sets',
        icon: 'pi pi-question-circle',
        acceptLabel: 'Finish',
        accept: () => this.completeWorkout(),
      });
    } else {
      this.completeWorkout();
    }
  }

  private completeWorkout() {
    if (!this.gymService.currentWorkout()) return;

    const completedWorkout: Workout = {
      ...this.gymService.currentWorkout()!,
      exercises: this.gymService.exercises(),
      endTime: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };

    this.gymService.saveWorkout(completedWorkout).subscribe({
      next: (data) => {
        this.gymService.currentWorkout.set(null);
        this.gymService.exercises.set([]);

        this.completedWorkout.set(data.workout);
        this.completedWorkoutInsights.set(data.insights);

        this.gymService.getWorkouts().subscribe({
          next: (workouts) => {
            this.gymService.workouts.set(workouts);
          },
        });

        this.showCompleteWorkout = true;
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save workout' });
      },
    });
  }

  confirmCancelWorkout() {
    this.confirm.confirm({
      message: 'Cancel this workout? All progress will be lost.',
      header: 'Cancel Workout',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Cancel workout',
      acceptVariant: 'danger',
      accept: () => this.cancelWorkout(),
    });
  }

  cancelWorkout() {
    if (!this.gymService.currentWorkout()) return;

    this.gymService.deleteWorkout(this.gymService.currentWorkout()!._id!).subscribe({
      next: () => {
        this.gymService.currentWorkout.set(null);
        this.gymService.exercises.set([]);
        this.toast.add({
          severity: 'info',
          summary: 'Workout Cancelled',
          detail: 'No worries, try again when ready!',
        });
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to cancel workout' });
      },
    });
  }

  onAddExerciseCancel() {
    this.showAddExercise = false;
  }

  handleCompleteWorkoutClose(value: boolean) {
    this.showCompleteWorkout = value;
    if (value === false) {
      this.completedWorkout.set(undefined);
      this.completedWorkoutInsights.set(undefined);
    }
  }
}
