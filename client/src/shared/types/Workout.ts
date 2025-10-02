import { ExerciseType } from './Exercise';

export interface Workout {
  _id?: string;
  sessionId?: string;
  createdAt: Date;
  startTime: string;
  endTime?: string;
  exercises: ExerciseType[];
  updatedAt?: Date;
  userId?: string;
}

export interface WorkoutStatHistory {
  date: string;
  weight: number;
  reps: number;
}

export interface WorkoutStat {
  exerciseName: ExerciseType['name'];
  history: WorkoutStatHistory[];
}
