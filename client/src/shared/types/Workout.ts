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
