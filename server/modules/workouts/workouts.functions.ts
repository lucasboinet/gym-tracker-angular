import { Workout, WorkoutCompute } from "./workouts.types";

export function computeWorkoutStats(workout: Workout): WorkoutCompute {
  let totalVolume = 0;
  let maxWeight = 0;
  const perExercise = [];

  for (const exercise of workout.exercises) {
    const exerciseVolume = exercise.sets.reduce(
      (sum, s) => sum + s.reps * s.weight,
      0
    );
    const exerciseMax = Math.max(...exercise.sets.map((s) => s.weight));
    totalVolume += exerciseVolume;
    maxWeight = Math.max(maxWeight, exerciseMax);
    perExercise.push({
      name: exercise.name,
      volume: exerciseVolume,
      max: exerciseMax,
    });
  }

  return { totalVolume, maxWeight, perExercise };
}

export function compareWorkouts(
  current: WorkoutCompute,
  previous: WorkoutCompute
): WorkoutCompute {
  const stats: WorkoutCompute = {
    totalVolume:
      ((current.totalVolume - previous.totalVolume) / previous.totalVolume) *
      100,
    maxWeight:
      ((current.maxWeight - previous.maxWeight) / previous.maxWeight) * 100,
    perExercise: [],
  };

  for (const ex of current.perExercise) {
    const prev = previous.perExercise.find((e) => e.name === ex.name);
    if (!prev) continue;
    stats.perExercise.push({
      name: ex.name,
      volume: ((ex.volume - prev.volume) / prev.volume) * 100,
      max: ((ex.max - prev.max) / prev.max) * 100,
    });
  }

  return stats;
}

export function getWorkoutInsights(comparison: WorkoutCompute) {
  const highlights = [];
  const improvements = [];
  const regressions = [];
  const suggestions = [];

  if (comparison.totalVolume > 5)
    improvements.push(
      `Overall workout volume increased by ${comparison.totalVolume.toFixed(
        1
      )}%.`
    );
  else if (comparison.totalVolume < -5)
    regressions.push(
      `Overall volume decreased by ${Math.abs(comparison.totalVolume).toFixed(
        1
      )}%.`
    );

  for (const ex of comparison.perExercise) {
    if (ex.volume > 5)
      improvements.push(`${ex.name}: +${ex.volume.toFixed(1)}% volume`);
    else if (ex.volume < -5)
      regressions.push(
        `${ex.name}: -${Math.abs(ex.volume).toFixed(1)}% volume`
      );

    if (ex.max > 0)
      highlights.push(
        `New PR on ${ex.name}: +${ex.max.toFixed(1)}% max weight`
      );
  }

  if (regressions.length > 2)
    suggestions.push("Consider taking a rest day or lowering intensity.");
  if (improvements.length > 3)
    suggestions.push(
      "Great consistency! Try increasing weights slightly next session."
    );

  return { highlights, improvements, regressions, suggestions };
}

export function estimateExerciseCalories(
  volume: number,
  isCompound: boolean,
  durationMin: number,
  userWeightKg: number
) {
  const baseMET = isCompound ? 6.0 : 4.0;
  const intensityFactor = Math.min(1 + volume / (userWeightKg * 1000), 2);
  const adjustedMET = baseMET * intensityFactor;
  return 0.0175 * adjustedMET * userWeightKg * durationMin;
}

export function estimateWorkoutCalories(
  userWeightKg: number,
  exercises: any[]
) {
  let totalCalories = 0;

  for (const ex of exercises) {
    const volume = ex.sets.reduce(
      (sum: number, s: any) => sum + s.reps * s.weight,
      0
    );
    const duration = ex.sets.length * 1.5; // ~1.5 min per set

    totalCalories += estimateExerciseCalories(
      volume,
      false,
      duration,
      userWeightKg
    );
  }

  return Math.round(totalCalories);
}
