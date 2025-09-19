import { Exercise } from "../workouts/workouts.types";

export type Session = {
  userId: string;
  name: string;
  exercises: Exercise[];
}