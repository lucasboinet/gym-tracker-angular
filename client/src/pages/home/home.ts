import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Workout } from '../../shared/types/Workout';
import { ExerciseType } from '../../shared/types/Exercise';
import { WorkoutService } from '../../services/workout.service';
import { NoActiveWorkout } from '../../components/no-active-workout/no-active-workout';

@Component({
  selector: 'home-page',
  imports: [
    RouterOutlet, 
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
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomePage implements OnInit {
  workouts: Workout[] = [];
  currentWorkout: Workout | null = null;
  exercises: ExerciseType[] = [];
  
  showAddExercise = false;
  showWorkoutHistory = false;
  newExerciseName = '';
  
  commonExercises = [
    'Bench Press', 'Squat', 'Deadlift', 'Shoulder Press', 
    'Pull-ups', 'Rows', 'Bicep Curls', 'Tricep Dips', 
    'Leg Press', 'Lat Pulldowns', 'Chest Fly', 'Leg Curls'
  ];

  constructor(
    private gymService: WorkoutService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit() {
    this.loadWorkouts();
    this.loadCurrentWorkout();
  }

  async loadWorkouts() {
    try {
      this.gymService.getWorkouts().subscribe({
        next: (data) => {
          this.workouts = data.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      });
    } catch (error) {
      this.showToast('error', 'Error', 'Failed to load workouts');
    }
  }

  async loadCurrentWorkout() {
    try {
      this.gymService.getCurrentWorkout().subscribe({
        next: (data) => {
          if (data) {
            this.currentWorkout = data;
            this.exercises = data.exercises || [];
          }
        }
      });
    } catch (error) {
      console.error('Error loading current workout:', error);
    }
  }

  async startWorkout() {
    const workout: Workout = {
      createdAt: new Date(),
      startTime: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      exercises: [],
    };

    this.gymService.createWorkout(workout).subscribe({
      next: (data) => {
        this.currentWorkout = data;
        this.exercises = [];
        this.showToast('success', 'Workout Started', 'Ready to crush your goals! 💪');
      },
      error: () => {
        this.showToast('error', 'Error', 'Failed to start workout');
      }
    });
  }

  addExercise(exerciseName: string) {
    if (!exerciseName?.trim()) return;

    const exercise: ExerciseType = {
      name: exerciseName.trim(),
      sets: [{ reps: 0, weight: 0 }]
    };
    
    this.exercises = [...this.exercises, exercise];
    this.saveCurrentExercises();
    this.newExerciseName = '';
    this.showAddExercise = false;
    
    this.showToast('success', 'Exercise Added', `${exerciseName} added to your workout`);
  }

  addSet(exerciseId: string) {
    const exerciseIndex = this.exercises.findIndex(ex => ex._id === exerciseId);
    if (exerciseIndex === -1) return;

    const lastSet = this.exercises[exerciseIndex].sets.slice(-1)[0];
    const newSet = { ...lastSet };

    this.exercises = this.exercises.map(exercise => {
      if (exercise._id === exerciseId) {
        return {
          ...exercise,
          sets: [...exercise.sets, newSet]
        };
      }
      return exercise;
    });
    
    this.saveCurrentExercises();
    this.showToast('info', 'Set Added', 'New set ready for action!');
  }

  updateSet(exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: number) {
    this.exercises = this.exercises.map(exercise => {
      if (exercise._id === exerciseId) {
        const updatedSets = [...exercise.sets];
        updatedSets[setIndex] = { 
          ...updatedSets[setIndex], 
          [field]: Math.max(0, value) // Ensure non-negative values
        };
        return { ...exercise, sets: updatedSets };
      }
      return exercise;
    });
    this.saveCurrentExercises();
  }

  removeSet(exerciseId: string, setIndex: number) {
    this.exercises = this.exercises.map(exercise => {
      if (exercise._id === exerciseId && exercise.sets.length > 1) {
        const updatedSets = exercise.sets.filter((_, index) => index !== setIndex);
        return { ...exercise, sets: updatedSets };
      }
      return exercise;
    });
    this.saveCurrentExercises();
  }

  removeExercise(exerciseId: string) {
    this.confirmationService.confirm({
      message: 'Remove this exercise from your workout?',
      header: 'Remove Exercise',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.exercises = this.exercises.filter(exercise => exercise._id !== exerciseId);
        this.saveCurrentExercises();
        this.showToast('info', 'Exercise Removed', 'Exercise removed from workout');
      }
    });
  }

  async saveCurrentExercises() {
    if (this.currentWorkout) {
      this.currentWorkout.exercises = this.exercises;
      this.gymService.saveCurrentWorkout(this.currentWorkout).subscribe({ error: () => {} });
    }
  }

  async finishWorkout() {
    if (this.exercises.length === 0) {
      this.showToast('warn', 'No Exercises', 'Add some exercises before finishing!');
      return;
    }

    // Check if any exercises have incomplete sets
    const hasIncompleteExercises = this.exercises.some(exercise =>
      exercise.sets.some(set => set.reps === 0 && set.weight === 0)
    );

    if (hasIncompleteExercises) {
      this.confirmationService.confirm({
        message: 'Some sets appear incomplete. Finish workout anyway?',
        header: 'Incomplete Sets',
        icon: 'pi pi-question-circle',
        accept: () => this.completeWorkout()
      });
    } else {
      this.completeWorkout();
    }
  }

  private completeWorkout() {
    if (!this.currentWorkout) return;

    const completedWorkout: Workout = {
      ...this.currentWorkout,
      exercises: this.exercises,
      endTime: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
    };

    this.gymService.saveWorkout(completedWorkout).subscribe({
      next: () => {
        this.currentWorkout = null;
        this.exercises = [];
        this.loadWorkouts();
        
        this.showToast('success', 'Workout Complete! 🎉', 'Amazing job! Keep it up!');
      },
      error: () => {
        this.showToast('error', 'Error', 'Failed to save workout');
      }
    });
  }

  confirmCancelWorkout() {
    this.confirmationService.confirm({
      message: 'Cancel this workout? All progress will be lost.',
      header: 'Cancel Workout',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.cancelWorkout()
    });
  }

  cancelWorkout() {
    if (!this.currentWorkout) return;

    this.gymService.deleteWorkout(this.currentWorkout._id!).subscribe({
      next: () => {
        this.currentWorkout = null;
        this.exercises = [];
        this.showToast('info', 'Workout Cancelled', 'No worries, try again when ready!');
      },
      error: () => {
        this.showToast('error', 'Error', 'Failed to cancel workout');
      }
    });
  }

  onAddExerciseCancel() {
    this.newExerciseName = '';
    this.showAddExercise = false;
  }

  private showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 3000
    });
  }

  // Helper method for calculating total volume
  getTotalVolume(exercise: ExerciseType): number {
    return exercise.sets.reduce((total, set) => total + (set.weight * set.reps), 0);
  }

  // Helper method for getting workout stats
  getWorkoutStats() {
    if (!this.exercises.length) return { exercises: 0, sets: 0, volume: 0 };
    
    const totalSets = this.exercises.reduce((total, ex) => total + ex.sets.length, 0);
    const totalVolume = this.exercises.reduce((total, ex) => total + this.getTotalVolume(ex), 0);
    
    return {
      exercises: this.exercises.length,
      sets: totalSets,
      volume: totalVolume
    };
  }
}