# Gym Tracker — Roadmap

Planned features, ordered by value/effort. Each entry lists scope, where it touches, and rough effort.

---

## 1. Rest timer between sets

Most-missing daily-use feature. During a live workout, after logging a set the user starts a countdown timer that alerts (sound/vibration) when rest is over.

**Scope**
- Configurable default rest duration (e.g. 60/90/120s), with quick +/- adjust.
- Auto-start on set logged (optional toggle).
- Sound + vibration (`navigator.vibrate`) on completion.
- Keep running/visible while navigating within the workout view.

**Touches**
- Client only — new timer component + integration into the workout logging UI.
- Optional: store default rest duration in settings (`server/modules/settings`).

**Effort:** Small. No backend required for MVP.

---

## 2. Fix `isCompound()` + PR / e1RM tracking

`isCompound()` in [workouts.functions.ts](server/modules/workouts/workouts.functions.ts) currently always returns `false`, so compound weighting and calorie MET adjustments never apply. Fix it, then build a per-exercise progress view.

**Scope**
- Implement `isCompound(name)` against a list of compound lifts (bench, squat, deadlift, overhead press, row, pull-up, etc.), case-insensitive / normalized matching.
- Compute estimated 1RM per set using Epley: `weight * (1 + reps / 30)`.
- Track best e1RM and best set (weight × reps) per exercise over time.
- New PR history page/chart: best-per-exercise trend line.

**Touches**
- Server: `workouts.functions.ts` (fix stub, add e1RM helpers), possibly `workouts.service.ts` for aggregation endpoint.
- Client: new PR/progress page + chart, wired into stats or history.

**Effort:** Medium. Reuses existing workout history data — no new storage.

---

## 3. Bodyweight tracking over time

Settings store only a single current weight value. Add time-series bodyweight logging to power trend charts and strength-to-bodyweight ratios (the insight code already accepts `userWeightKg`).

**Scope**
- Log bodyweight entries with a date.
- Trend chart over time.
- Strength-to-bodyweight ratio surfaced in stats/insights.
- Respect existing weight unit setting.

**Touches**
- Server: new model + migration (new `bodyweight` collection/table), service, controller, routes.
- Client: bodyweight log UI + chart, integrate into stats.

**Effort:** Medium. Needs a small new model + migration.

---

## 4. Progressive-overload suggestions

Turn the tracker into a light coach. When starting a session, prefill the last-recorded weights/reps per exercise and suggest a small progression.

**Scope**
- On session start, look up the most recent workout matching the session's exercises.
- Prefill previous weights/reps.
- Suggest next target: e.g. `+2.5kg` or `+1 rep` based on last performance (and fatigue signals already computed in insights).

**Touches**
- Server: query last workout per exercise (`workouts.service.ts`), progression helper in `workouts.functions.ts`.
- Client: show prefilled values + suggestion in the live workout UI.

**Effort:** Medium. Uses existing history and insight logic.

---

### Suggested order

1 (fast, used every session) → 2 (fixes real bug, unlocks progress view) → 3 → 4.
