import { Workout, WorkoutCompute, WorkoutInsight } from "./workouts.types";

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

function isCompound(exerciseName: string): boolean {
  return false;
}

function percentChange(current: number, previous: number): number {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function computeIntensity(totalVolume: number, durationMs?: number) {
  if (!durationMs) return undefined;
  const minutes = durationMs / 60000;
  return totalVolume / Math.max(minutes, 1);
}

export function compareWorkouts(
  current: WorkoutCompute,
  previous: WorkoutCompute,
  durationMs?: number
): WorkoutCompute {
  const currentIntensity = computeIntensity(current.totalVolume, durationMs);
  const prevIntensity = previous.intensity;

  return {
    totalVolume: percentChange(current.totalVolume, previous.totalVolume),
    maxWeight: percentChange(current.maxWeight, previous.maxWeight),
    intensity: percentChange(currentIntensity || 0, prevIntensity || 0),
    perExercise: current.perExercise
      .filter((ex) => previous.perExercise.some((e) => e.name === ex.name))
      .map((ex) => {
        const prev = previous.perExercise.find((e) => e.name === ex.name)!;
        const weightedVolume = percentChange(ex.volume, prev.volume);
        const weightedMax = percentChange(ex.max, prev.max);
        return { name: ex.name, volume: weightedVolume, max: weightedMax };
      }),
  };
}

export function getWorkoutInsights(
  comparison: WorkoutCompute,
  userWeightKg?: number
): WorkoutInsight {
  const highlights: string[] = [];
  const improvements: string[] = [];
  const regressions: string[] = [];
  const suggestions: string[] = [];

  if (comparison.totalVolume > 5)
    improvements.push(
      `Total workout volume increased by ${comparison.totalVolume.toFixed(1)}%.`
    );
  else if (comparison.totalVolume < -5)
    regressions.push(
      `Total workout volume dropped by ${Math.abs(
        comparison.totalVolume
      ).toFixed(1)}%.`
    );

  let regressionCount = 0;
  let improvementCount = 0;

  for (const ex of comparison.perExercise) {
    const compoundFactor = isCompound(ex.name) ? 1.5 : 1;
    const weightedVol = ex.volume * compoundFactor;

    if (weightedVol > 5) {
      improvements.push(`${ex.name}: +${ex.volume.toFixed(1)}% volume`);
      improvementCount++;
    } else if (weightedVol < -5) {
      regressions.push(
        `${ex.name}: -${Math.abs(ex.volume).toFixed(1)}% volume`
      );
      regressionCount++;
    }

    if (ex.max > 2)
      highlights.push(
        `New PR on ${ex.name}: +${ex.max.toFixed(1)}% max weight`
      );
  }

  if (comparison.intensity && Math.abs(comparison.intensity) > 5) {
    if (comparison.intensity > 5)
      improvements.push(
        `Session intensity improved by ${comparison.intensity.toFixed(1)}%.`
      );
    else
      regressions.push(
        `Session intensity decreased by ${Math.abs(
          comparison.intensity
        ).toFixed(1)}%.`
      );
  }

  const fatigueDetected =
    regressionCount >= comparison.perExercise.length / 2 &&
    comparison.totalVolume < 0;

  if (fatigueDetected)
    suggestions.push(
      "Multiple regressions detected — possible fatigue. Consider a lighter session or rest day."
    );

  if (improvementCount > 3)
    suggestions.push(
      "Strong overall progress — consider adding load or volume next week."
    );
  if (regressionCount > 2 && !fatigueDetected)
    suggestions.push(
      "Some exercises dropped off — maybe adjust technique or warm-up."
    );
  if (highlights.length && improvementCount < 2)
    suggestions.push(
      "Nice PRs! Keep consistency to turn them into lasting gains."
    );

  if (userWeightKg && comparison.perExercise.length > 0) {
    const bestLift = comparison.perExercise.reduce((a, b) =>
      a.max > b.max ? a : b
    );
    const ratio = (bestLift.max / userWeightKg) * 100;
    if (ratio > 120)
      highlights.push(
        `Your ${bestLift.name} is ${ratio.toFixed(
          0
        )}% of bodyweight — strong progress!`
      );
  }

  return {
    highlights,
    improvements,
    regressions,
    suggestions,
    meta: {
      intensityChange: comparison.intensity,
      fatigueDetected,
    },
  };
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
