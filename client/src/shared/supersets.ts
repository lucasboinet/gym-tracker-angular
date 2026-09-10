import { ExerciseType } from './types/Exercise';

/** One rendered block: a standalone exercise, or a superset holding several. */
export interface ExerciseBlock {
  key: string;
  type: 'single' | 'superset';
  supersetId?: string;
  items: BlockItem[];
}

export interface BlockItem {
  exercise: ExerciseType;
  /** Index in the flat exercises array. */
  index: number;
  /** 1-based position within a superset (0 for standalone). */
  position: number;
  first: boolean;
  last: boolean;
  /** Rest is shown/triggered only on the last member (or a standalone). */
  showRest: boolean;
}

/** Random-ish id for a new superset group. */
export function newSupersetId(): string {
  return 'ss_' + Math.random().toString(36).slice(2, 9);
}

/**
 * Group consecutive exercises sharing a supersetId into superset blocks; the
 * rest render as standalone blocks. A superset may hold a single exercise.
 */
export function buildBlocks(exercises: ExerciseType[]): ExerciseBlock[] {
  const blocks: ExerciseBlock[] = [];
  let i = 0;

  while (i < exercises.length) {
    const id = exercises[i].supersetId;

    if (!id) {
      blocks.push({
        key: exercises[i]._id ?? `idx-${i}`,
        type: 'single',
        items: [{ exercise: exercises[i], index: i, position: 0, first: true, last: true, showRest: true }],
      });
      i++;
      continue;
    }

    let end = i;
    while (end + 1 < exercises.length && exercises[end + 1].supersetId === id) end++;

    const items: BlockItem[] = [];
    for (let j = i; j <= end; j++) {
      items.push({
        exercise: exercises[j],
        index: j,
        position: j - i + 1,
        first: j === i,
        last: j === end,
        showRest: j === end,
      });
    }
    blocks.push({ key: id, type: 'superset', supersetId: id, items });
    i = end + 1;
  }

  return blocks;
}

/** Flatten blocks back into a flat exercises array. */
export function blocksToExercises(blocks: ExerciseBlock[]): ExerciseType[] {
  return blocks.flatMap((b) => b.items.map((it) => it.exercise));
}

/** Turn a standalone exercise into a (single-member) superset. */
export function convertToSuperset(exercises: ExerciseType[], index: number): ExerciseType[] {
  if (index < 0 || index >= exercises.length) return exercises;
  const id = newSupersetId();
  return exercises.map((ex, i) => (i === index ? { ...ex, supersetId: id } : ex));
}

/** Clear the supersetId of every exercise in the given group. */
export function ungroupSuperset(exercises: ExerciseType[], supersetId: string): ExerciseType[] {
  return exercises.map((ex) =>
    ex.supersetId === supersetId ? { ...ex, supersetId: undefined } : ex,
  );
}

/**
 * Remove one exercise from its superset. The freed exercise is moved just after
 * the group so the remaining members stay contiguous.
 */
export function removeFromSuperset(exercises: ExerciseType[], index: number): ExerciseType[] {
  if (index < 0 || index >= exercises.length) return exercises;
  const id = exercises[index].supersetId;
  if (!id) return exercises;

  // Bounds of the contiguous run this exercise belongs to.
  let start = index;
  while (start - 1 >= 0 && exercises[start - 1].supersetId === id) start--;
  let end = index;
  while (end + 1 < exercises.length && exercises[end + 1].supersetId === id) end++;

  const arr = [...exercises];
  const [freed] = arr.splice(index, 1);
  freed.supersetId = undefined;
  // After splice, the run's last remaining member sits at end-1; insert after it.
  arr.splice(end, 0, freed);
  return arr;
}

/**
 * Insert a new exercise as the last member of the given superset (right after
 * its current last member).
 */
export function addToSuperset(
  exercises: ExerciseType[],
  supersetId: string,
  exercise: ExerciseType,
): ExerciseType[] {
  let lastIndex = -1;
  for (let i = 0; i < exercises.length; i++) {
    if (exercises[i].supersetId === supersetId) lastIndex = i;
  }
  const member = { ...exercise, supersetId };
  if (lastIndex === -1) return [...exercises, member];
  const arr = [...exercises];
  arr.splice(lastIndex + 1, 0, member);
  return arr;
}
