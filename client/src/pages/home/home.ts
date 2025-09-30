import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { AddExerciseDialog } from '../../components/add-exercise-dialog/add-exercise-dialog';
import { ExerciseCard } from '../../components/exercise-card/exercise-card';
import { NoActiveWorkout } from '../../components/no-active-workout/no-active-workout';
import { WorkoutService } from '../../services/workout.service';
import { ExerciseType } from '../../shared/types/Exercise';
import { Workout } from '../../shared/types/Workout';

@Component({
  selector: 'home-page',
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    InputNumberModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    FormsModule,
    NoActiveWorkout,
    AddExerciseDialog,
    ExerciseCard,
  ],
  templateUrl: './home.html',
})
export class HomePage implements OnInit {
  showAddExercise = false;
  updateCurrentWorkoutTimeout: NodeJS.Timeout | undefined;

  gymService = inject(WorkoutService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  ngOnInit() {
    this.loadCurrentWorkout();
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
        this.showToast('success', 'Workout Started', 'Ready to crush your goals! 💪');
      },
      error: () => {
        this.showToast('error', 'Error', 'Failed to start workout');
      },
    });
  }

  addExercise(exerciseName: string) {
    if (!exerciseName?.trim()) return;

    const exercise: ExerciseType = {
      name: exerciseName.trim(),
      sets: [{ reps: 0, weight: 0 }],
    };

    this.gymService.exercises.set([...this.gymService.exercises(), exercise]);
    this.saveCurrentExercises();
    this.showAddExercise = false;
  }

  addSet(exerciseId: string) {
    const exerciseIndex = this.gymService.exercises().findIndex((ex) => ex._id === exerciseId);
    if (exerciseIndex === -1) return;

    const lastSet = this.gymService.exercises()[exerciseIndex].sets.slice(-1)[0];
    const newSet = { ...lastSet };

    this.gymService.exercises.set(
      this.gymService.exercises().map((exercise) => {
        if (exercise._id === exerciseId) {
          return {
            ...exercise,
            sets: [...exercise.sets, newSet],
          };
        }
        return exercise;
      }),
    );

    this.saveCurrentExercises();
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

  removeExercise(exerciseId: string) {
    this.confirmationService.confirm({
      message: 'Remove this exercise from your workout?',
      header: 'Remove Exercise',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
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
      this.showToast('warn', 'No Exercises', 'Add some exercises before finishing!');
      return;
    }

    // Check if any exercises have incomplete sets
    const hasIncompleteExercises = this.gymService
      .exercises()
      .some((exercise) => exercise.sets.some((set) => set.reps === 0 && set.weight === 0));

    if (hasIncompleteExercises) {
      this.confirmationService.confirm({
        message: 'Some sets appear incomplete. Finish workout anyway?',
        header: 'Incomplete Sets',
        icon: 'pi pi-question-circle',
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
      next: () => {
        this.gymService.currentWorkout.set(null);
        this.gymService.exercises.set([]);

        this.gymService.getWorkouts().subscribe({
          next: (workouts) => {
            this.gymService.workouts.set(workouts);
          },
        });

        this.showToast('success', 'Workout Complete! 🎉', 'Amazing job! Keep it up!');
      },
      error: () => {
        this.showToast('error', 'Error', 'Failed to save workout');
      },
    });
  }

  confirmCancelWorkout() {
    this.confirmationService.confirm({
      message: 'Cancel this workout? All progress will be lost.',
      header: 'Cancel Workout',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.cancelWorkout(),
    });
  }

  cancelWorkout() {
    if (!this.gymService.currentWorkout()) return;

    this.gymService.deleteWorkout(this.gymService.currentWorkout()!._id!).subscribe({
      next: () => {
        this.gymService.currentWorkout.set(null);
        this.gymService.exercises.set([]);
        this.showToast('info', 'Workout Cancelled', 'No worries, try again when ready!');
      },
      error: () => {
        this.showToast('error', 'Error', 'Failed to cancel workout');
      },
    });
  }

  onAddExerciseCancel() {
    this.showAddExercise = false;
  }

  private showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 3000,
    });
  }

  // Helper method for calculating total volume
  getTotalVolume(exercise: ExerciseType): number {
    return exercise.sets.reduce((total, set) => total + set.weight * set.reps, 0);
  }

  // Helper method for getting workout stats
  getWorkoutStats() {
    if (!this.gymService.exercises().length) return { exercises: 0, sets: 0, volume: 0 };

    const totalSets = this.gymService.exercises().reduce((total, ex) => total + ex.sets.length, 0);
    const totalVolume = this.gymService
      .exercises()
      .reduce((total, ex) => total + this.getTotalVolume(ex), 0);

    return {
      exercises: this.gymService.exercises().length,
      sets: totalSets,
      volume: totalVolume,
    };
  }
}
