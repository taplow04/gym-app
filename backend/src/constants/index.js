// Central enums — referenced by models AND validators so the two can
// never drift apart.

const ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin",
  COACH: "coach", // future-ready
  PREMIUM: "premium", // future-ready
});

// Mirrors client/src/data/exercises.js (the master dataset the seed imports).
const MUSCLES = Object.freeze([
  "Chest",
  "Back",
  "Shoulders",
  "Traps",
  "Biceps",
  "Triceps",
  "Forearms",
  "Core",
  "Obliques",
  "Lower Back",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Adductors",
  "Abductors",
  "Hip Flexors",
  "Neck",
  "Legs", // legacy value — old custom exercises may still carry it
  "Full Body",
  "Olympic",
  "Cardio",
  "Mobility",
]);

const EQUIPMENT = Object.freeze([
  "Barbell",
  "Dumbbell",
  "Kettlebell",
  "Machine",
  "Cable",
  "Smith Machine",
  "Bodyweight",
  "Band",
  "Trap Bar",
  "EZ Bar",
  "Medicine Ball",
  "Plate",
  "Sled",
  "Box",
  "Other",
]);

const DIFFICULTY = Object.freeze(["beginner", "intermediate", "advanced"]);

const EXERCISE_CATEGORIES = Object.freeze([
  "strength",
  "cardio",
  "mobility",
  "core",
  "olympic",
  "plyometric",
]);

const MECHANICS = Object.freeze(["compound", "isolation"]);

const MOVEMENT_PATTERNS = Object.freeze([
  "push",
  "pull",
  "hinge",
  "squat",
  "lunge",
  "carry",
  "rotation",
  "core",
  "isometric",
  "cardio",
  "plyo",
  "olympic",
  "mobility",
  "stretch",
]);

const SET_TYPES = Object.freeze(["normal", "warmup", "dropset", "superset"]);

const SESSION_STATUS = Object.freeze(["active", "completed"]);

const GOAL_TYPES = Object.freeze([
  "weight", // target body weight
  "weekly-workouts",
  "protein",
  "water",
  "calories",
  "custom",
]);

const REMINDER_TYPES = Object.freeze(["workout", "water", "meal", "rest"]);

const NOTIFICATION_TYPES = Object.freeze([
  "workout-completed",
  "new-pr",
  "goal-achieved",
  "reminder",
  "system",
]);

const FITNESS_GOALS = Object.freeze([
  "lose-fat",
  "build-muscle",
  "gain-strength",
  "maintain",
  "improve-endurance",
]);

const ACTIVITY_LEVELS = Object.freeze([
  "sedentary",
  "light",
  "moderate",
  "active",
  "very-active",
]);

const EXPERIENCE_LEVELS = Object.freeze(["beginner", "intermediate", "advanced"]);

const GENDERS = Object.freeze(["male", "female", "other", "prefer-not-to-say"]);

const UNITS = Object.freeze(["kg", "lb"]);

const THEMES = Object.freeze(["dark", "light", "system"]);

module.exports = {
  ROLES,
  MUSCLES,
  EQUIPMENT,
  DIFFICULTY,
  EXERCISE_CATEGORIES,
  MECHANICS,
  MOVEMENT_PATTERNS,
  SET_TYPES,
  SESSION_STATUS,
  GOAL_TYPES,
  REMINDER_TYPES,
  NOTIFICATION_TYPES,
  FITNESS_GOALS,
  ACTIVITY_LEVELS,
  EXPERIENCE_LEVELS,
  GENDERS,
  UNITS,
  THEMES,
};
