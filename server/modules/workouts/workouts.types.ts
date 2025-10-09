export type Set = {
  weight: number;
  reps: number;
};

export type Exercise = {
  sets: Set[];
  name: string;
  _id: string;
};

export type Workout = {
  _id: string;
  sessionId?: string;
  userId: string;
  createdAt: Date;
  startTime: string;
  endTime?: string;
  calories?: number;
  exercises: Exercise[];
};

export type WorkoutCompute = {
  totalVolume: number;
  maxWeight: number;
  perExercise: { name: string; volume: number; max: number }[];
};
