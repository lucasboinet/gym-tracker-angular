import { ExerciseType } from './Exercise';

export interface Workout {
  _id?: string;
  createdAt: Date;
  startTime: string;
  endTime?: string;
  exercises: ExerciseType[];
  updatedAt?: Date;
  userId?: string;
}

export interface WorkoutStat {
  exerciseName: ExerciseType['name'];
  weights: Map<string, number>[];
}
