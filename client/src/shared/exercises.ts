// Keep this list in sync with the server copy in
// server/modules/workouts/workouts.functions.ts (COMPOUND_KEYWORDS).
export const COMPOUND_KEYWORDS = [
  'squat',
  'deadlift',
  'bench',
  'press',
  'overhead',
  'ohp',
  'row',
  'pull-up',
  'pullup',
  'chin-up',
  'chinup',
  'clean',
  'snatch',
  'lunge',
  'dip',
  'hip thrust',
];

export function isCompound(exerciseName: string): boolean {
  const normalized = exerciseName.toLowerCase().trim();
  return COMPOUND_KEYWORDS.some((keyword) => normalized.includes(keyword));
}
