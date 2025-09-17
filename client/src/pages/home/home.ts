import { Component, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MenuBar } from '../../components/menu/menu';
import { SetInput } from '../../components/set-input/set-input';
import { Workout } from '../../shared/types/Workout';
import { ExerciseType } from '../../shared/types/Exercise';
import { WorkoutService } from '../../services/workout.service';

@Component({
  selector: 'home-page',
  imports: [
    RouterOutlet, 
    ButtonModule, 
    CardModule, 
    InputNumberModule, 
    DialogModule, 
    ToastModule, 
    ConfirmDialogModule, 
    FormsModule,
    MenuBar,
    SetInput,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './home.html',
})
export class HomePage implements OnInit {
  workouts: Workout[] = [];
  currentWorkout: Workout | null = null;
  exercises: ExerciseType[] = [];
  
  showAddExercise = false;
  showWorkoutHistory = false;
  newExerciseName = '';
  
  commonExercises = [
    'Bench Press', 'Squat', 'Deadlift', 'Shoulder Press', 'Pull-ups',
    'Rows', 'Bicep Curls', 'Tricep Dips', 'Leg Press', 'Lat Pulldowns'
  ];

  constructor(
    private gymService: WorkoutService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadWorkouts();
    this.loadCurrentWorkout();
  }

  async loadWorkouts() {
    try {
      this.gymService.getWorkouts().subscribe((data) => {
        this.workouts = data;
        this.cdr.detectChanges();
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load workouts'
      });
    }
  }

  async loadCurrentWorkout() {
    try {
      this.gymService.getCurrentWorkout().subscribe((data) => {
        if (data) {
          this.currentWorkout = data;
          this.exercises = data.exercises || [];
        }
        this.cdr.detectChanges();
      });
    } catch (error) {
      console.error('Error loading current workout:', error);
    }
  }

  async startWorkout() {
    const workout: Workout = {
      createdAt: new Date(),
      startTime: new Date().toLocaleTimeString(),
      exercises: [],
    };

      this.gymService.createWorkout(workout).subscribe({
        next: (data) => {
          this.currentWorkout = data;
          this.exercises = [];
          this.cdr.detectChanges();
          this.messageService.add({
            severity: 'success',
            summary: 'Workout Started',
            detail: 'Your workout session has begun!'
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to start workout'
          });
        }
      });

  }

  addExercise(exerciseName: string) {
    const exercise: ExerciseType = {
      name: exerciseName,
      sets: [{ reps: 0, weight: 0 }]
    };
    
    this.exercises = [...this.exercises, exercise];
    this.saveCurrentExercises();
    this.newExerciseName = '';
    this.showAddExercise = false;
    
    this.messageService.add({
      severity: 'success',
      summary: 'Exercise Added',
      detail: `${exerciseName} added to workout`
    });
  }

  addSet(exerciseId: string) {
    this.exercises = this.exercises.map(exercise => {
      if (exercise._id === exerciseId) {
        return {
          ...exercise,
          sets: [...exercise.sets, { reps: 0, weight: 0 }]
        };
      }
      return exercise;
    });
    this.saveCurrentExercises();
  }

  updateSet(exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: number) {
    this.exercises = this.exercises.map(exercise => {
      if (exercise._id === exerciseId) {
        const updatedSets = [...exercise.sets];
        updatedSets[setIndex] = { ...updatedSets[setIndex], [field]: value };
        return { ...exercise, sets: updatedSets };
      }
      return exercise;
    });
    this.saveCurrentExercises();
  }

  removeSet(exerciseId: string, setIndex: number) {
    this.exercises = this.exercises.map(exercise => {
      if (exercise._id === exerciseId) {
        const updatedSets = exercise.sets.filter((_, index) => index !== setIndex);
        return { ...exercise, sets: updatedSets };
      }
      return exercise;
    });
    this.saveCurrentExercises();
  }

  removeExercise(exerciseId: string) {
    this.exercises = this.exercises.filter(exercise => exercise._id !== exerciseId);
    this.saveCurrentExercises();
  }

  async saveCurrentExercises() {
    if (this.currentWorkout) {
      this.currentWorkout.exercises = this.exercises;
      this.gymService.saveCurrentWorkout(this.currentWorkout).subscribe();
    }
  }

  async finishWorkout() {
    if (this.exercises.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Exercises',
        detail: 'Add some exercises before finishing your workout!'
      });
      return;
    }

    if (!this.currentWorkout) return;

    const completedWorkout: Workout = {
      ...this.currentWorkout,
      exercises: this.exercises,
      endTime: new Date().toLocaleTimeString(),
    };

    this.gymService.saveWorkout(completedWorkout).subscribe({
      next: () => {
        this.currentWorkout = null;
        this.exercises = [];
        
        this.loadWorkouts();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Workout Complete!',
          detail: 'Great job! Your workout has been saved.'
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save workout'
        });
      }
    });
  }

  confirmCancelWorkout() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to cancel this workout? All progress will be lost.',
      header: 'Cancel Workout',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.cancelWorkout();
      }
    });
  }

  cancelWorkout() {
    if (!this.currentWorkout) return;

    this.gymService.deleteWorkout(this.currentWorkout._id!).subscribe({
      next: () => {
        this.currentWorkout = null;
        this.exercises = [];

        this.messageService.add({
          severity: 'info',
          summary: 'Workout Cancelled',
          detail: 'Your workout has been cancelled'
        });
      },
      error: (err) => {
        console.error('Failed to cancel workout', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to cancel workout'
        });
      }
    });
  }

  onAddExerciseCancel() {
    this.newExerciseName = '';
    this.showAddExercise = false;
  }
}
