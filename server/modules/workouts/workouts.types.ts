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

export interface ExerciseStats {
  name: string;
  volume: number;
  max: number;
}

export interface WorkoutCompute {
  totalVolume: number;
  maxWeight: number;
  intensity?: number;
  perExercise: ExerciseStats[];
}

export interface WorkoutInsight {
  highlights: string[];
  improvements: string[];
  regressions: string[];
  suggestions: string[];
  meta?: {
    intensityChange?: number;
    fatigueDetected?: boolean;
  };
}
