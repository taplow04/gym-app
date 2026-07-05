// Central enums — referenced by models AND validators so the two can
// never drift apart.

const ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin",
  COACH: "coach", // future-ready
  PREMIUM: "premium", // future-ready
});

const MUSCLES = Object.freeze([
  "Chest",
  "Back",
  "Shoulders",
  "Legs",
  "Glutes",
  "Biceps",
  "Triceps",
  "Forearms",
  "Core",
  "Full Body",
  "Cardio",
]);

const EQUIPMENT = Object.freeze([
  "Barbell",
  "Dumbbell",
  "Machine",
  "Cable",
  "Kettlebell",
  "Bodyweight",
  "Band",
  "Other",
]);

const DIFFICULTY = Object.freeze(["beginner", "intermediate", "advanced"]);

const EXERCISE_CATEGORIES = Object.freeze(["strength", "cardio", "mobility", "core"]);

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
