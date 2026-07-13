// Seeds the global exercise library (user: null) from the MASTER dataset
// in client/src/data/exercises.js — one source of truth for app + API.
// Idempotent: upserts by name (the unique {user, name} index), so
// re-running — even over a pre-rewrite database — updates in place.
// Usage: npm run seed

const path = require("path");
const { pathToFileURL } = require("url");
const connectDB = require("../config/db");
const Exercise = require("../models/Exercise");

const DATASET = path.resolve(__dirname, "../../../client/src/data/exercises.js");

async function loadLibrary() {
  // The dataset is an ES module with zero dependencies — dynamic import
  // works from CommonJS. The monorepo is always deployed whole, so the
  // client folder exists wherever this script runs.
  const mod = await import(pathToFileURL(DATASET).href);
  return mod.EXERCISES;
}

async function seed() {
  const library = await loadLibrary();
  await connectDB();
  let created = 0;
  let updated = 0;

  for (const ex of library) {
    const doc = {
      name: ex.name,
      slug: ex.id,
      aliases: ex.aliases,
      primaryMuscle: ex.muscle,
      secondaryMuscles: ex.secondary,
      equipment: ex.equipment,
      difficulty: ex.difficulty,
      category: ex.category,
      mechanics: ex.mechanics,
      movementPattern: ex.pattern,
      description: ex.desc,
      instructions: ex.steps,
      commonMistakes: ex.mistakes,
      tips: ex.tips,
      repRange: ex.repRange,
      restSec: ex.restSec,
      user: null,
    };
    const result = await Exercise.updateOne(
      { user: null, name: ex.name },
      { $set: doc },
      { upsert: true }
    );
    if (result.upsertedCount) created += 1;
    else if (result.modifiedCount) updated += 1;
  }

  console.log(
    `✓ Exercise library seeded: ${created} created, ${updated} updated, ${library.length} total`
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
