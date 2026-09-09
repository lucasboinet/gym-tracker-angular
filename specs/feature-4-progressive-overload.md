# Feature 4 — Progressive-Overload Suggestions

Status: **spec / draft**
Depends on: existing workout history, `isCompound()` (feature 2), previous-set lookup already in `set-input`.

---

## 1. Goal

Turn the tracker into a light coach. When a user trains an exercise they have
done before, the app should **suggest** the next progression (e.g. `+2.5 kg` or
`+1 rep`) based on last performance, respecting fatigue signals.

This is a hint, never a forced value — set values are **never mutated
automatically**. The existing "Previous weight/reps" display stays; the user
taps a suggestion chip to apply it.

> Decision (A): **suggestion-only**. No auto-prefill of set values. The chip is
> the single, explicit way last-time-derived numbers enter a set.

---

## 2. Background — what already exists

- `set-input` computes `previousMatchingSet` (same exercise, same set index,
  most recent other workout) and renders "Previous weight/reps".
- `exercise-card` computes `previousMatchingExercise` for notes.
- Both read from `WorkoutService.workouts()` (a signal of the user's workouts).
- `isCompound(name)` distinguishes compound vs isolation lifts (server side;
  a client copy is needed — see §7).
- Insights already produce `meta.fatigueDetected` and per-exercise regressions
  server-side, but that runs only on workout completion; it is **not** available
  when starting the next workout. Progression here is computed client-side.

> Gap: on the Home page, `workouts()` is only populated *after* finishing a
> workout, not on load. Feature 4 must ensure the history is loaded when an
> active workout is opened (see §6).

---

## 3. Scope

### In scope (v1)
- Per-set progression suggestion chip that the user can tap to apply.
- Double-progression logic using a global default rep range (8–12).
- Fatigue-aware "hold" recommendation.
- kg/lbs aware increments (compound +2.5 kg / +5 lbs, isolation +1.25 kg / +2.5 lbs).

### Out of scope (v1 — noted for later)
- Per-exercise configurable rep ranges / increments (uses global defaults now).
- Server-persisted progression targets or a coaching endpoint.
- Deload scheduling, RPE/RIR input, 1RM-based percentages.
- Auto-advancing across a mesocycle.

---

## 4. UX

### 4.1 Suggestion chip
Under each set row (near the existing "Start rest" chip), show a compact chip:

```
↗ Suggest 82.5 kg × 8
```

- Shown only when a previous matching set exists.
- Tapping it applies the suggested weight & reps to that set's inputs.
- When the recommendation is to hold (fatigue/regression), the chip reads
  `→ Hold 80 kg × 8` with a neutral color and a short reason on long-press/title.

### 4.2 Placement / clutter
`set-input` already renders a rest chip. The suggestion chip sits on the same
row, left-aligned; rest chip stays where it is. On narrow screens they wrap.

---

## 5. Progression algorithm

Inputs per set: `last = { weight, reps }`, `isCompound`, `unit`, global
`repRange = { min: 8, max: 12 }`, and a `fatigue` flag for the exercise.

Increment table (per unit):
| lift type | kg   | lbs |
|-----------|------|-----|
| compound  | +2.5 | +5  |
| isolation | +1.25| +2.5|

Rules (double progression):

1. **No history** → no suggestion (chip hidden).
2. **Fatigue / regression** → `hold`: suggest `{ weight: last.weight, reps: last.reps }`.
3. **reps < repRange.max** → `{ weight: last.weight, reps: last.reps + 1 }`
   (add a rep at the same weight).
4. **reps >= repRange.max** → `{ weight: last.weight + increment, reps: repRange.min }`
   (add load, reset to bottom of range).

`fatigue` for an exercise (client-side heuristic, since server insights aren't
available pre-workout): compare the two most recent completed workouts that
contain the exercise; if the latest total volume for that exercise dropped
> 5% vs the prior one, treat as fatigued/regressed → hold.

Weight rounding: round to the nearest `0.5` in the stored kg space after any
unit conversion so plate math stays sane.

---

## 6. Implementation plan

### Client
- `shared/progression.ts`
  - `type SetSuggestion = { weight: number; reps: number; kind: 'increase' | 'hold'; reason?: string }`
  - `suggestNextSet(last: SetType, opts: { isCompound: boolean; unit: string; repRange?: {min:number;max:number}; fatigued?: boolean }): SetSuggestion`
  - helpers: `progressionIncrement(isCompound, unit)`, `roundToHalf(n)`.
- `shared/exercises.ts`
  - client copy of `isCompound(name)` + `COMPOUND_KEYWORDS` (mirror of server;
    keep the two lists in sync — see §7).
- `set-input`
  - add `previousMatchingSet` is already there; add a `suggestion` computed
    using `suggestNextSet(previousMatchingSet(), …)`.
  - render the suggestion chip; `applySuggestion()` emits `updateSet` for weight
    and reps.
  - needs the exercise's `fatigued` flag → provided by `exercise-card` as an
    input, or computed in `set-input` from `workoutService.workouts()`.
- `exercise-card`
  - compute `fatigued` for the exercise once (volume drop heuristic) and pass to
    `set-input` so each set doesn't recompute.
- `home`
  - ensure `workoutService.getWorkouts()` runs when the active workout loads, so
    suggestions have history to read from.

### Server
- **None required for v1.** All logic reuses existing `GET /workouts`.

---

## 7. Risks / notes

- **Duplicated `isCompound`**: server has it; client needs its own copy. Risk of
  drift. Mitigation: keep both keyword lists identical and add a comment cross-
  referencing each other. (A shared package is out of scope.)
- **History loading**: extra `GET /workouts` on Home load. Acceptable; the list
  is already fetched elsewhere and cached in the signal.
- **Set index matching**: prefill/suggestion match by set index, same as the
  existing "previous" display. If the user did fewer sets last time, later sets
  have no suggestion (chip hidden).
- **Global rep range**: 8–12 won't suit every exercise (e.g. heavy triples).
  Acceptable for v1; per-exercise range is a fast follow.

---

## 8. Acceptance criteria

1. Set values are never mutated automatically; the existing "Previous
   weight/reps" display is unchanged.
2. Each set with a matching previous set shows a suggestion chip; tapping it
   fills that set with the suggested weight/reps.
3. When last reps < 12, suggestion is `same weight, +1 rep`; when reps >= 12,
   suggestion is `+increment weight, reps reset to 8`.
4. Compound lifts increment by 2.5 kg (5 lbs), isolation by 1.25 kg (2.5 lbs).
5. When the exercise's latest volume dropped > 5% vs the prior session, the chip
   recommends holding, not increasing.
6. Values display and apply correctly in both kg and lbs.
7. No server changes; no regressions to existing "previous" display or rest timer.

---

## 9. Decisions (locked)

- **A. Behavior**: **suggestion-only** — never auto-mutate set values.
- **B. Progression model**: **double progression**, global rep range **8–12**.
- **C. Increments**: compound **+2.5 kg** / +5 lbs, isolation **+1.25 kg** / +2.5 lbs.
