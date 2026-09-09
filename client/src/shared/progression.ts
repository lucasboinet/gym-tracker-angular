import { SetType } from './types/Set';

export interface RepRange {
  min: number;
  max: number;
}

export const DEFAULT_REP_RANGE: RepRange = { min: 8, max: 12 };

export interface SetSuggestion {
  /** Suggested weight, in kg (same space as stored set values). */
  weight: number;
  reps: number;
  kind: 'increase' | 'hold';
  reason?: string;
}

/** Progression weight step in kg for the given lift type. */
export function progressionIncrementKg(isCompound: boolean): number {
  return isCompound ? 2.5 : 1.25;
}

/** Round a kg value to the nearest 0.5 kg. */
export function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

/**
 * Double-progression suggestion for the next time an exercise is performed.
 * Set weights are stored in kg throughout the app.
 */
export function suggestNextSet(
  last: SetType,
  opts: {
    isCompound: boolean;
    repRange?: RepRange;
    fatigued?: boolean;
  },
): SetSuggestion | null {
  if (!last || (!last.weight && !last.reps)) return null;

  const range = opts.repRange ?? DEFAULT_REP_RANGE;

  if (opts.fatigued) {
    return {
      weight: last.weight,
      reps: last.reps,
      kind: 'hold',
      reason: 'Volume dropped last session — hold and consolidate.',
    };
  }

  if (last.reps < range.max) {
    return {
      weight: last.weight,
      reps: last.reps + 1,
      kind: 'increase',
      reason: `Add a rep (aim for ${range.max}).`,
    };
  }

  // Hit the top of the range → add load, reset to the bottom.
  return {
    weight: roundToHalf(last.weight + progressionIncrementKg(opts.isCompound)),
    reps: range.min,
    kind: 'increase',
    reason: 'Hit the rep target — add load and reset reps.',
  };
}
