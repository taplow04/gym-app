// FORGE — Exercise library
// Flat, searchable catalog. Sessions copy name/muscle at log time,
// so renaming here never corrupts history.

export const MUSCLES = [
  "Chest",
  "Back",
  "Shoulders",
  "Legs",
  "Biceps",
  "Triceps",
  "Core",
  "Full Body",
  "Cardio",
];

export const EXERCISES = [
  // Chest
  { id: "bench-press", name: "Barbell Bench Press", muscle: "Chest" },
  { id: "incline-db-press", name: "Incline Dumbbell Press", muscle: "Chest" },
  { id: "db-bench-press", name: "Dumbbell Bench Press", muscle: "Chest" },
  { id: "cable-fly", name: "Cable Fly", muscle: "Chest" },
  { id: "chest-dip", name: "Chest Dip", muscle: "Chest" },
  { id: "push-up", name: "Push-Up", muscle: "Chest" },
  { id: "machine-chest-press", name: "Machine Chest Press", muscle: "Chest" },
  { id: "pec-deck", name: "Pec Deck", muscle: "Chest" },

  // Back
  { id: "deadlift", name: "Deadlift", muscle: "Back" },
  { id: "pull-up", name: "Pull-Up", muscle: "Back" },
  { id: "chin-up", name: "Chin-Up", muscle: "Back" },
  { id: "lat-pulldown", name: "Lat Pulldown", muscle: "Back" },
  { id: "barbell-row", name: "Barbell Row", muscle: "Back" },
  { id: "seated-row", name: "Seated Cable Row", muscle: "Back" },
  { id: "single-arm-db-row", name: "Single-Arm Dumbbell Row", muscle: "Back" },
  { id: "t-bar-row", name: "T-Bar Row", muscle: "Back" },
  { id: "back-extension", name: "Back Extension", muscle: "Back" },

  // Shoulders
  { id: "overhead-press", name: "Overhead Press", muscle: "Shoulders" },
  { id: "db-shoulder-press", name: "Dumbbell Shoulder Press", muscle: "Shoulders" },
  { id: "lateral-raise", name: "Lateral Raise", muscle: "Shoulders" },
  { id: "front-raise", name: "Front Raise", muscle: "Shoulders" },
  { id: "rear-delt-fly", name: "Rear Delt Fly", muscle: "Shoulders" },
  { id: "face-pull", name: "Face Pull", muscle: "Shoulders" },
  { id: "arnold-press", name: "Arnold Press", muscle: "Shoulders" },
  { id: "shrug", name: "Barbell Shrug", muscle: "Shoulders" },

  // Legs
  { id: "squat", name: "Barbell Squat", muscle: "Legs" },
  { id: "front-squat", name: "Front Squat", muscle: "Legs" },
  { id: "goblet-squat", name: "Goblet Squat", muscle: "Legs" },
  { id: "leg-press", name: "Leg Press", muscle: "Legs" },
  { id: "lunge", name: "Walking Lunge", muscle: "Legs" },
  { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", muscle: "Legs" },
  { id: "romanian-deadlift", name: "Romanian Deadlift", muscle: "Legs" },
  { id: "leg-extension", name: "Leg Extension", muscle: "Legs" },
  { id: "leg-curl", name: "Leg Curl", muscle: "Legs" },
  { id: "hip-thrust", name: "Hip Thrust", muscle: "Legs" },
  { id: "calf-raise", name: "Standing Calf Raise", muscle: "Legs" },

  // Biceps
  { id: "barbell-curl", name: "Barbell Curl", muscle: "Biceps" },
  { id: "db-curl", name: "Dumbbell Curl", muscle: "Biceps" },
  { id: "hammer-curl", name: "Hammer Curl", muscle: "Biceps" },
  { id: "preacher-curl", name: "Preacher Curl", muscle: "Biceps" },
  { id: "incline-db-curl", name: "Incline Dumbbell Curl", muscle: "Biceps" },
  { id: "cable-curl", name: "Cable Curl", muscle: "Biceps" },
  { id: "wrist-curl", name: "Wrist Curl", muscle: "Biceps" },

  // Triceps
  { id: "triceps-pushdown", name: "Triceps Pushdown", muscle: "Triceps" },
  { id: "skull-crusher", name: "Skull Crusher", muscle: "Triceps" },
  { id: "overhead-triceps-ext", name: "Overhead Triceps Extension", muscle: "Triceps" },
  { id: "close-grip-bench", name: "Close-Grip Bench Press", muscle: "Triceps" },
  { id: "triceps-dip", name: "Triceps Dip", muscle: "Triceps" },
  { id: "triceps-kickback", name: "Triceps Kickback", muscle: "Triceps" },

  // Core
  { id: "plank", name: "Plank", muscle: "Core" },
  { id: "crunch", name: "Crunch", muscle: "Core" },
  { id: "hanging-leg-raise", name: "Hanging Leg Raise", muscle: "Core" },
  { id: "russian-twist", name: "Russian Twist", muscle: "Core" },
  { id: "cable-crunch", name: "Cable Crunch", muscle: "Core" },
  { id: "ab-wheel", name: "Ab Wheel Rollout", muscle: "Core" },
  { id: "side-plank", name: "Side Plank", muscle: "Core" },

  // Full body
  { id: "kettlebell-swing", name: "Kettlebell Swing", muscle: "Full Body" },
  { id: "clean-and-press", name: "Clean & Press", muscle: "Full Body" },
  { id: "thruster", name: "Dumbbell Thruster", muscle: "Full Body" },
  { id: "burpee", name: "Burpee", muscle: "Full Body" },
  { id: "farmers-carry", name: "Farmer's Carry", muscle: "Full Body" },

  // Cardio
  { id: "treadmill-run", name: "Treadmill Run", muscle: "Cardio" },
  { id: "rowing-machine", name: "Rowing Machine", muscle: "Cardio" },
  { id: "stationary-bike", name: "Stationary Bike", muscle: "Cardio" },
  { id: "stair-climber", name: "Stair Climber", muscle: "Cardio" },
  { id: "jump-rope", name: "Jump Rope", muscle: "Cardio" },
];

const byId = new Map(EXERCISES.map((e) => [e.id, e]));

export function getExercise(id) {
  return byId.get(id) || null;
}
