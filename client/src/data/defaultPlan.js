// FORGE — Default weekly split (Monday-first).
// Seeds the editable plan on first launch; preserves the spirit of
// the original routine (chest / back / shoulders+core / legs / arms /
// full body / rest) with real, prescribable exercises.

export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const DEFAULT_PLAN = [
  {
    focus: "Chest Day",
    rest: false,
    exercises: ["bench-press", "incline-db-press", "cable-fly", "push-up"],
  },
  {
    focus: "Back Day",
    rest: false,
    exercises: ["deadlift", "pull-up", "lat-pulldown", "seated-row"],
  },
  {
    focus: "Shoulders & Core",
    rest: false,
    exercises: ["overhead-press", "lateral-raise", "face-pull", "plank", "hanging-leg-raise"],
  },
  {
    focus: "Leg Day",
    rest: false,
    exercises: ["squat", "leg-press", "lunge", "leg-curl", "calf-raise"],
  },
  {
    focus: "Arms Day",
    rest: false,
    exercises: ["barbell-curl", "hammer-curl", "triceps-pushdown", "skull-crusher", "wrist-curl"],
  },
  {
    focus: "Full Body & Core",
    rest: false,
    exercises: ["kettlebell-swing", "goblet-squat", "push-up", "russian-twist", "plank"],
  },
  {
    focus: "Rest Day",
    rest: true,
    exercises: [],
  },
];
