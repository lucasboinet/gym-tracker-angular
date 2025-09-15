export type Set = {
  weight: string;
  reps: string;
}

export type Exercise = {
  sets: Set[];
  name: string;
  _id: string;
}

export type Workout = {
  _id: string,
  createdAt: Date,
  startTime: string,
  endTime?: string,
  exercises: Exercise[],
}