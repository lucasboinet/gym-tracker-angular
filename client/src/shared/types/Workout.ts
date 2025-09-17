import {ExerciseType} from "./Exercise";

export type Workout = {
  _id?: string,
  createdAt: Date,
  startTime: string,
  endTime?: string,
  exercises: ExerciseType[],
}