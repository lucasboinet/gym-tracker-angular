import { ExerciseType } from './Exercise';

export interface Session {
  _id?: string;
  userId: string;
  name: string;
  exercises: ExerciseType[];
  createdAt: Date;
  updatedAt: Date;
}
