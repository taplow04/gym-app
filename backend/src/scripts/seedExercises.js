// Seeds the global exercise library (user: null). Idempotent — upserts
// by name, so re-running updates rather than duplicates.
// Usage: npm run seed

const connectDB = require("../config/db");
const Exercise = require("../models/Exercise");

// [name, primaryMuscle, equipment, difficulty, category, secondaryMuscles, instructions]
const LIB = [
  // Chest
  ["Barbell Bench Press", "Chest", "Barbell", "intermediate", "strength", ["Triceps", "Shoulders"], ["Lie on the bench, grip slightly wider than shoulders.", "Lower the bar to mid-chest under control.", "Press up until arms are locked out."]],
  ["Incline Dumbbell Press", "Chest", "Dumbbell", "intermediate", "strength", ["Shoulders", "Triceps"], ["Set the bench to 30–45°.", "Press the dumbbells up and slightly together."]],
  ["Dumbbell Bench Press", "Chest", "Dumbbell", "beginner", "strength", ["Triceps"], []],
  ["Cable Fly", "Chest", "Cable", "beginner", "strength", [], ["Slight forward lean, soft elbows.", "Squeeze the chest as hands meet."]],
  ["Pec Deck", "Chest", "Machine", "beginner", "strength", [], []],
  ["Chest Dip", "Chest", "Bodyweight", "intermediate", "strength", ["Triceps"], ["Lean forward to bias the chest."]],
  ["Push-Up", "Chest", "Bodyweight", "beginner", "strength", ["Triceps", "Core"], ["Body in one straight line.", "Chest to an inch off the floor."]],
  ["Machine Chest Press", "Chest", "Machine", "beginner", "strength", ["Triceps"], []],

  // Back
  ["Deadlift", "Back", "Barbell", "advanced", "strength", ["Legs", "Glutes", "Core"], ["Bar over mid-foot, hinge at the hips.", "Brace hard; push the floor away.", "Lock out by squeezing the glutes."]],
  ["Pull-Up", "Back", "Bodyweight", "intermediate", "strength", ["Biceps"], ["Full hang to chin over the bar."]],
  ["Chin-Up", "Back", "Bodyweight", "intermediate", "strength", ["Biceps"], []],
  ["Lat Pulldown", "Back", "Cable", "beginner", "strength", ["Biceps"], ["Pull to the upper chest, elbows down and back."]],
  ["Barbell Row", "Back", "Barbell", "intermediate", "strength", ["Biceps", "Core"], ["Hinge to ~45°, pull to the lower ribs."]],
  ["Seated Cable Row", "Back", "Cable", "beginner", "strength", ["Biceps"], []],
  ["Single-Arm Dumbbell Row", "Back", "Dumbbell", "beginner", "strength", ["Biceps"], []],
  ["T-Bar Row", "Back", "Machine", "intermediate", "strength", ["Biceps"], []],
  ["Back Extension", "Back", "Bodyweight", "beginner", "strength", ["Glutes"], []],

  // Shoulders
  ["Overhead Press", "Shoulders", "Barbell", "intermediate", "strength", ["Triceps", "Core"], ["Bar at collarbone, brace, press overhead.", "Finish with biceps by the ears."]],
  ["Dumbbell Shoulder Press", "Shoulders", "Dumbbell", "beginner", "strength", ["Triceps"], []],
  ["Arnold Press", "Shoulders", "Dumbbell", "intermediate", "strength", ["Triceps"], []],
  ["Lateral Raise", "Shoulders", "Dumbbell", "beginner", "strength", [], ["Lead with the elbows; stop at shoulder height."]],
  ["Front Raise", "Shoulders", "Dumbbell", "beginner", "strength", [], []],
  ["Rear Delt Fly", "Shoulders", "Dumbbell", "beginner", "strength", ["Back"], []],
  ["Face Pull", "Shoulders", "Cable", "beginner", "strength", ["Back"], ["Pull rope to the forehead, elbows high, external rotation."]],
  ["Barbell Shrug", "Shoulders", "Barbell", "beginner", "strength", [], []],

  // Legs
  ["Barbell Squat", "Legs", "Barbell", "intermediate", "strength", ["Glutes", "Core"], ["Bar on upper back, feet shoulder-width.", "Sit down between the hips, break parallel.", "Drive up through mid-foot."]],
  ["Front Squat", "Legs", "Barbell", "advanced", "strength", ["Core", "Glutes"], []],
  ["Goblet Squat", "Legs", "Kettlebell", "beginner", "strength", ["Glutes", "Core"], []],
  ["Leg Press", "Legs", "Machine", "beginner", "strength", ["Glutes"], []],
  ["Walking Lunge", "Legs", "Dumbbell", "beginner", "strength", ["Glutes", "Core"], []],
  ["Bulgarian Split Squat", "Legs", "Dumbbell", "intermediate", "strength", ["Glutes"], []],
  ["Romanian Deadlift", "Legs", "Barbell", "intermediate", "strength", ["Glutes", "Back"], ["Soft knees, push hips back, bar close to legs.", "Stretch the hamstrings, then stand tall."]],
  ["Leg Extension", "Legs", "Machine", "beginner", "strength", [], []],
  ["Leg Curl", "Legs", "Machine", "beginner", "strength", [], []],
  ["Hip Thrust", "Glutes", "Barbell", "intermediate", "strength", ["Legs"], []],
  ["Standing Calf Raise", "Legs", "Machine", "beginner", "strength", [], []],

  // Biceps
  ["Barbell Curl", "Biceps", "Barbell", "beginner", "strength", ["Forearms"], []],
  ["Dumbbell Curl", "Biceps", "Dumbbell", "beginner", "strength", ["Forearms"], []],
  ["Hammer Curl", "Biceps", "Dumbbell", "beginner", "strength", ["Forearms"], []],
  ["Preacher Curl", "Biceps", "Machine", "beginner", "strength", [], []],
  ["Incline Dumbbell Curl", "Biceps", "Dumbbell", "intermediate", "strength", [], []],
  ["Cable Curl", "Biceps", "Cable", "beginner", "strength", [], []],
  ["Wrist Curl", "Forearms", "Dumbbell", "beginner", "strength", [], []],

  // Triceps
  ["Triceps Pushdown", "Triceps", "Cable", "beginner", "strength", [], []],
  ["Skull Crusher", "Triceps", "Barbell", "intermediate", "strength", [], []],
  ["Overhead Triceps Extension", "Triceps", "Dumbbell", "beginner", "strength", [], []],
  ["Close-Grip Bench Press", "Triceps", "Barbell", "intermediate", "strength", ["Chest"], []],
  ["Triceps Dip", "Triceps", "Bodyweight", "intermediate", "strength", ["Chest"], []],
  ["Triceps Kickback", "Triceps", "Dumbbell", "beginner", "strength", [], []],

  // Core
  ["Plank", "Core", "Bodyweight", "beginner", "core", [], ["Elbows under shoulders, squeeze glutes, don't sag."]],
  ["Side Plank", "Core", "Bodyweight", "beginner", "core", [], []],
  ["Crunch", "Core", "Bodyweight", "beginner", "core", [], []],
  ["Hanging Leg Raise", "Core", "Bodyweight", "intermediate", "core", ["Forearms"], []],
  ["Russian Twist", "Core", "Bodyweight", "beginner", "core", [], []],
  ["Cable Crunch", "Core", "Cable", "beginner", "core", [], []],
  ["Ab Wheel Rollout", "Core", "Other", "advanced", "core", ["Back"], []],

  // Full body
  ["Kettlebell Swing", "Full Body", "Kettlebell", "intermediate", "strength", ["Glutes", "Core"], ["Hinge, not squat — snap the hips forward."]],
  ["Clean & Press", "Full Body", "Barbell", "advanced", "strength", ["Shoulders", "Legs"], []],
  ["Dumbbell Thruster", "Full Body", "Dumbbell", "intermediate", "strength", ["Shoulders", "Legs"], []],
  ["Burpee", "Full Body", "Bodyweight", "beginner", "cardio", ["Core"], []],
  ["Farmer's Carry", "Full Body", "Dumbbell", "beginner", "strength", ["Forearms", "Core"], []],

  // Cardio
  ["Treadmill Run", "Cardio", "Machine", "beginner", "cardio", ["Legs"], []],
  ["Rowing Machine", "Cardio", "Machine", "beginner", "cardio", ["Back", "Legs"], []],
  ["Stationary Bike", "Cardio", "Machine", "beginner", "cardio", ["Legs"], []],
  ["Stair Climber", "Cardio", "Machine", "beginner", "cardio", ["Legs", "Glutes"], []],
  ["Jump Rope", "Cardio", "Other", "beginner", "cardio", ["Legs"], []],
];

async function seed() {
  await connectDB();
  let created = 0;
  let updated = 0;

  for (const [name, primaryMuscle, equipment, difficulty, category, secondaryMuscles, instructions] of LIB) {
    const doc = {
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      primaryMuscle,
      equipment,
      difficulty,
      category,
      secondaryMuscles,
      instructions,
      user: null,
    };
    const result = await Exercise.updateOne(
      { user: null, name },
      { $set: doc },
      { upsert: true }
    );
    if (result.upsertedCount) created += 1;
    else if (result.modifiedCount) updated += 1;
  }

  console.log(`✓ Exercise library seeded: ${created} created, ${updated} updated, ${LIB.length} total`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
