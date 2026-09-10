import { SetType } from './Set';

export interface ExerciseType {
  sets: SetType[];
  name: string;
  _id?: string;
  notes?: string;
  restTime?: number;
  /** Exercises sharing this id (and adjacent in the list) form a superset. */
  supersetId?: string;
}
