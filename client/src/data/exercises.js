// FORGE — Exercise library (master dataset).
// Single source of truth: the app reads it directly and the API seed
// (backend/src/scripts/seedExercises.js) imports this same file.
//
// Sessions copy name/muscle at log time, so edits here never corrupt
// history. ⚠️ ids are stable forever — plans and history reference them.

export const MUSCLES = [
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
  "Full Body",
  "Olympic",
  "Cardio",
  "Mobility",
];

export const EQUIPMENT = [
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
];

export const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

// Push / Pull / Legs classification, derived from the primary muscle.
const PPL = {
  Chest: "Push", Shoulders: "Push", Triceps: "Push",
  Back: "Pull", Biceps: "Pull", Traps: "Pull", Forearms: "Pull", Neck: "Pull",
  Quads: "Legs", Hamstrings: "Legs", Glutes: "Legs", Calves: "Legs",
  Adductors: "Legs", Abductors: "Legs", "Hip Flexors": "Legs",
  Core: "Core", Obliques: "Core", "Lower Back": "Core",
  "Full Body": "Full body", Olympic: "Full body",
  Cardio: "Conditioning", Mobility: "Mobility",
};

// Sensible programming defaults per category/mechanics — overridable per row.
function programming(category, mechanics) {
  if (category === "cardio") return { repRange: "10–30 min", restSec: 60, focus: ["endurance"] };
  if (category === "mobility") return { repRange: "30–60s per side", restSec: 15, focus: ["mobility"] };
  if (category === "olympic") return { repRange: "2–5", restSec: 180, focus: ["strength", "power"] };
  if (category === "plyometric") return { repRange: "3–6", restSec: 120, focus: ["power"] };
  if (category === "core") return { repRange: "10–20 or 30–60s", restSec: 60, focus: ["endurance", "hypertrophy"] };
  if (mechanics === "compound") return { repRange: "5–10", restSec: 150, focus: ["strength", "hypertrophy"] };
  return { repRange: "10–15", restSec: 90, focus: ["hypertrophy"] };
}

function inferCategory(muscle, pattern) {
  if (pattern === "cardio") return "cardio";
  if (pattern === "plyo") return "plyometric";
  if (pattern === "olympic") return "olympic";
  if (pattern === "mobility" || pattern === "stretch") return "mobility";
  if (muscle === "Core" || muscle === "Obliques" || muscle === "Lower Back") return "core";
  return "strength";
}

/** Compact row builder — o: { sec, aka, d, steps, mistakes, tips, reps, rest, cat } */
function x(id, name, muscle, equipment, difficulty, mechanics, pattern, o = {}) {
  const category = o.cat || inferCategory(muscle, pattern);
  const prog = programming(category, mechanics);
  return {
    id,
    name,
    muscle,
    secondary: o.sec || [],
    equipment,
    difficulty,
    mechanics, // "compound" | "isolation"
    pattern, // push | pull | hinge | squat | lunge | carry | rotation | core | isometric | cardio | plyo | olympic | mobility | stretch
    category, // strength | core | cardio | mobility | olympic | plyometric
    ppl: PPL[muscle] || "Other",
    repRange: o.reps || prog.repRange,
    restSec: o.rest ?? prog.restSec,
    focus: o.focus || prog.focus,
    aliases: o.aka || [],
    desc: o.d || "",
    steps: o.steps || [],
    mistakes: o.mistakes || [],
    tips: o.tips || [],
  };
}

export const EXERCISES = [
  /* ============================== CHEST ============================== */
  x("bench-press", "Barbell Bench Press", "Chest", "Barbell", "intermediate", "compound", "push", {
    sec: ["Triceps", "Shoulders"], aka: ["Flat Bench", "BB Bench"],
    d: "The classic barbell press for overall chest mass and pressing strength.",
    steps: ["Lie with eyes under the bar, feet planted, slight arch.", "Grip a little wider than shoulder width, unrack over the shoulders.", "Lower to mid-chest under control, forearms vertical.", "Press up and slightly back until lockout."],
    mistakes: ["Bouncing the bar off the chest.", "Flaring the elbows to 90°.", "Lifting the hips off the bench."],
    tips: ["Squeeze the bar and pull it apart to engage the lats.", "Keep shoulder blades pinched the whole set."],
  }),
  x("incline-db-press", "Incline Dumbbell Press", "Chest", "Dumbbell", "intermediate", "compound", "push", {
    sec: ["Shoulders", "Triceps"],
    d: "Presses on a 30–45° incline to bias the upper chest.",
    steps: ["Set the bench to 30–45°.", "Start with dumbbells at shoulder level, wrists stacked.", "Press up and slightly together without clanking.", "Lower with a full, controlled stretch."],
    mistakes: ["Setting the incline too steep — it becomes a shoulder press."],
    tips: ["Lower until you feel a stretch across the clavicular fibers."],
  }),
  x("db-bench-press", "Dumbbell Bench Press", "Chest", "Dumbbell", "beginner", "compound", "push", {
    sec: ["Triceps", "Shoulders"],
    d: "Flat pressing with independent arms — bigger range of motion and stabiliser demand than the bar.",
  }),
  x("incline-barbell-press", "Incline Barbell Press", "Chest", "Barbell", "intermediate", "compound", "push", {
    sec: ["Shoulders", "Triceps"],
    d: "Barbell pressing on an incline for upper-chest strength.",
  }),
  x("decline-bench-press", "Decline Bench Press", "Chest", "Barbell", "intermediate", "compound", "push", {
    sec: ["Triceps"],
    d: "Declined pressing that biases the lower chest with a short, strong stroke.",
  }),
  x("cable-fly", "Cable Fly", "Chest", "Cable", "beginner", "isolation", "push", {
    d: "Constant-tension fly that isolates the pecs through a long arc.",
    steps: ["Set handles at chest height, take a slight forward lean.", "Soft elbows locked in place; sweep the hands together.", "Squeeze for a beat where the hands meet."],
    mistakes: ["Turning it into a press by bending the elbows."],
  }),
  x("low-cable-fly", "Low-to-High Cable Fly", "Chest", "Cable", "beginner", "isolation", "push", {
    d: "Upward fly path that targets the upper chest fibers.",
  }),
  x("db-fly", "Dumbbell Fly", "Chest", "Dumbbell", "intermediate", "isolation", "push", {
    d: "Flat-bench fly emphasising the stretched position of the pecs.",
    mistakes: ["Going too heavy and turning it into a press.", "Dropping too deep and straining the shoulder."],
  }),
  x("incline-db-fly", "Incline Dumbbell Fly", "Chest", "Dumbbell", "intermediate", "isolation", "push", {
    d: "Fly on an incline to stretch and load the upper chest.",
  }),
  x("pec-deck", "Pec Deck", "Chest", "Machine", "beginner", "isolation", "push", {
    aka: ["Machine Fly"],
    d: "Guided machine fly — easy to load, hard to cheat.",
  }),
  x("machine-chest-press", "Machine Chest Press", "Chest", "Machine", "beginner", "compound", "push", {
    sec: ["Triceps"],
    d: "Fixed-path pressing, ideal for safe loading close to failure.",
  }),
  x("machine-incline-press", "Machine Incline Press", "Chest", "Machine", "beginner", "compound", "push", {
    sec: ["Shoulders", "Triceps"],
    d: "Guided incline press for upper-chest volume without a spotter.",
  }),
  x("smith-bench-press", "Smith Machine Bench Press", "Chest", "Smith Machine", "beginner", "compound", "push", {
    sec: ["Triceps"],
    d: "Fixed-bar pressing — stable, spotter-free chest work.",
  }),
  x("chest-dip", "Chest Dip", "Chest", "Bodyweight", "intermediate", "compound", "push", {
    sec: ["Triceps", "Shoulders"],
    d: "Forward-leaning dip that loads the lower chest through a deep stretch.",
    tips: ["Lean the torso forward and flare elbows slightly to bias the chest."],
  }),
  x("push-up", "Push-Up", "Chest", "Bodyweight", "beginner", "compound", "push", {
    sec: ["Triceps", "Core"],
    d: "The fundamental bodyweight press — chest, triceps and trunk in one move.",
    steps: ["Hands under shoulders, body in one straight line.", "Lower until the chest is an inch off the floor.", "Press away without the hips sagging or piking."],
    mistakes: ["Flared elbows.", "Half reps.", "Sagging hips."],
  }),
  x("incline-push-up", "Incline Push-Up", "Chest", "Bodyweight", "beginner", "compound", "push", {
    sec: ["Triceps"],
    d: "Hands-elevated push-up — the easiest regression to build volume.",
  }),
  x("decline-push-up", "Decline Push-Up", "Chest", "Bodyweight", "intermediate", "compound", "push", {
    sec: ["Shoulders", "Triceps"],
    d: "Feet-elevated push-up that shifts load to the upper chest and shoulders.",
  }),
  x("weighted-push-up", "Weighted Push-Up", "Chest", "Plate", "intermediate", "compound", "push", {
    sec: ["Triceps", "Core"],
    d: "Push-up with a plate on the back — progressive overload without a bench.",
  }),
  x("floor-press", "Dumbbell Floor Press", "Chest", "Dumbbell", "beginner", "compound", "push", {
    sec: ["Triceps"],
    d: "Pressing from the floor — shoulder-friendly with a built-in range limit.",
  }),
  x("landmine-press", "Landmine Press", "Chest", "Barbell", "beginner", "compound", "push", {
    sec: ["Shoulders", "Core"],
    d: "Angled one-arm press that's easy on cranky shoulders.",
  }),
  x("svend-press", "Svend Press", "Chest", "Plate", "beginner", "isolation", "push", {
    d: "Squeezing plates together while pressing — an intense inner-chest burn.",
  }),
  x("band-chest-press", "Band Chest Press", "Chest", "Band", "beginner", "compound", "push", {
    sec: ["Triceps"],
    d: "Standing band press — travel-friendly chest work with rising tension.",
  }),

  /* ============================== BACK ============================== */
  x("deadlift", "Deadlift", "Back", "Barbell", "advanced", "compound", "hinge", {
    sec: ["Hamstrings", "Glutes", "Lower Back", "Traps", "Forearms"], aka: ["Conventional Deadlift"],
    d: "The heaviest pull in the gym — total posterior-chain strength off the floor.",
    steps: ["Bar over mid-foot, shins an inch away.", "Hinge down, grip just outside the legs, brace hard.", "Push the floor away, keeping the bar against the body.", "Lock out by squeezing the glutes — don't lean back."],
    mistakes: ["Rounding the lower back.", "Jerking the bar off the floor.", "Letting the bar drift away from the shins."],
    tips: ["Take the slack out of the bar before you pull.", "Think 'push the floor', not 'lift the bar'."],
    reps: "3–6", rest: 210,
  }),
  x("sumo-deadlift", "Sumo Deadlift", "Back", "Barbell", "advanced", "compound", "hinge", {
    sec: ["Glutes", "Quads", "Adductors"],
    d: "Wide-stance deadlift with a more upright torso — hip- and quad-dominant.",
    reps: "3–6", rest: 210,
  }),
  x("trap-bar-deadlift", "Trap Bar Deadlift", "Back", "Trap Bar", "intermediate", "compound", "hinge", {
    sec: ["Quads", "Glutes", "Traps"], aka: ["Hex Bar Deadlift"],
    d: "Neutral-grip deadlift that's easier to learn and kinder to the spine.",
    reps: "4–8", rest: 180,
  }),
  x("rack-pull", "Rack Pull", "Back", "Barbell", "intermediate", "compound", "hinge", {
    sec: ["Traps", "Forearms", "Lower Back"],
    d: "Partial deadlift from knee height — overloads the lockout and upper back.",
    reps: "4–8", rest: 180,
  }),
  x("pull-up", "Pull-Up", "Back", "Bodyweight", "intermediate", "compound", "pull", {
    sec: ["Biceps", "Core"],
    d: "Overhand vertical pull — the gold standard for lat width.",
    steps: ["Full hang, hands just outside shoulders.", "Drive the elbows down to the ribs.", "Chin clears the bar; lower under full control."],
    mistakes: ["Kipping or swinging.", "Cutting the range short at the bottom."],
    tips: ["Think about pulling the bar to your chest, not your chin over the bar."],
  }),
  x("chin-up", "Chin-Up", "Back", "Bodyweight", "intermediate", "compound", "pull", {
    sec: ["Biceps"],
    d: "Underhand pull-up — more biceps, a touch easier than overhand.",
  }),
  x("neutral-grip-pull-up", "Neutral-Grip Pull-Up", "Back", "Bodyweight", "intermediate", "compound", "pull", {
    sec: ["Biceps"],
    d: "Palms-facing pull-up — the most joint-friendly grip.",
  }),
  x("weighted-pull-up", "Weighted Pull-Up", "Back", "Other", "advanced", "compound", "pull", {
    sec: ["Biceps", "Core"],
    d: "Belt-loaded pull-ups for serious upper-body pulling strength.",
    reps: "3–6", rest: 180,
  }),
  x("lat-pulldown", "Lat Pulldown", "Back", "Cable", "beginner", "compound", "pull", {
    sec: ["Biceps"],
    d: "Cable vertical pull — build toward pull-ups or push lat volume high.",
    steps: ["Grip wide, lean back slightly.", "Pull the bar to the upper chest, elbows down and back.", "Control the stretch on the way up."],
    mistakes: ["Rocking the torso to heave the weight.", "Pulling behind the neck."],
  }),
  x("close-grip-pulldown", "Close-Grip Pulldown", "Back", "Cable", "beginner", "compound", "pull", {
    sec: ["Biceps"],
    d: "Narrow neutral grip pulldown with a long stretch for the lats.",
  }),
  x("straight-arm-pulldown", "Straight-Arm Pulldown", "Back", "Cable", "beginner", "isolation", "pull", {
    aka: ["Lat Prayer"],
    d: "Straight-arm sweep that isolates the lats with zero biceps.",
  }),
  x("barbell-row", "Barbell Row", "Back", "Barbell", "intermediate", "compound", "pull", {
    sec: ["Biceps", "Lower Back", "Traps"], aka: ["Bent-Over Row"],
    d: "The big horizontal pull for mid-back thickness.",
    steps: ["Hinge to roughly 45°, flat back, bar under the shoulders.", "Row to the lower ribs, elbows tracking back.", "Lower under control without dropping the chest."],
    mistakes: ["Standing too upright and turning it into a shrug.", "Using momentum from the hips."],
  }),
  x("pendlay-row", "Pendlay Row", "Back", "Barbell", "advanced", "compound", "pull", {
    sec: ["Biceps", "Lower Back"],
    d: "Strict row from a dead stop on the floor every rep — raw pulling power.",
    reps: "4–6", rest: 180,
  }),
  x("seated-row", "Seated Cable Row", "Back", "Cable", "beginner", "compound", "pull", {
    sec: ["Biceps"],
    d: "Seated horizontal pull with constant tension through the mid-back.",
    tips: ["Drive the elbows back and squeeze the shoulder blades together each rep."],
  }),
  x("machine-row", "Machine Row", "Back", "Machine", "beginner", "compound", "pull", {
    sec: ["Biceps"],
    d: "Chest-supported machine pull — pure back work, no lower-back fatigue.",
  }),
  x("chest-supported-row", "Chest-Supported Dumbbell Row", "Back", "Dumbbell", "beginner", "compound", "pull", {
    sec: ["Biceps", "Traps"],
    d: "Rowing prone on an incline bench — strict, spine-friendly thickness work.",
  }),
  x("single-arm-db-row", "Single-Arm Dumbbell Row", "Back", "Dumbbell", "beginner", "compound", "pull", {
    sec: ["Biceps"],
    d: "One-arm row braced on a bench — big stretch, big contraction per side.",
  }),
  x("meadows-row", "Meadows Row", "Back", "Barbell", "intermediate", "compound", "pull", {
    sec: ["Biceps", "Traps"],
    d: "Landmine one-arm row popularised by John Meadows — brutal upper-back builder.",
  }),
  x("t-bar-row", "T-Bar Row", "Back", "Machine", "intermediate", "compound", "pull", {
    sec: ["Biceps"],
    d: "Chest-height leverage row for heavy mid-back loading.",
  }),
  x("seal-row", "Seal Row", "Back", "Barbell", "intermediate", "compound", "pull", {
    sec: ["Biceps"],
    d: "Rowing while lying flat on a high bench — zero momentum, all back.",
  }),
  x("inverted-row", "Inverted Row", "Back", "Bodyweight", "beginner", "compound", "pull", {
    sec: ["Biceps", "Core"], aka: ["Australian Pull-Up"],
    d: "Bodyweight row under a bar — scalable by foot position.",
  }),
  x("band-pulldown", "Band Pulldown", "Back", "Band", "beginner", "compound", "pull", {
    sec: ["Biceps"],
    d: "Anchor a band overhead and pull — lat work anywhere.",
  }),

  /* ============================ SHOULDERS ============================ */
  x("overhead-press", "Overhead Press", "Shoulders", "Barbell", "intermediate", "compound", "push", {
    sec: ["Triceps", "Core"], aka: ["OHP", "Military Press", "Strict Press"],
    d: "Standing barbell press — the truest test of upper-body pushing strength.",
    steps: ["Bar at the collarbone, grip just outside shoulders.", "Brace glutes and abs; press straight up.", "Pass the face, then push the head 'through the window'.", "Finish with biceps by the ears."],
    mistakes: ["Leaning back into a standing incline press.", "Pressing around the chin instead of moving it out of the way."],
  }),
  x("db-shoulder-press", "Dumbbell Shoulder Press", "Shoulders", "Dumbbell", "beginner", "compound", "push", {
    sec: ["Triceps"],
    d: "Overhead pressing with free-moving dumbbells — even delt development.",
  }),
  x("seated-db-press", "Seated Dumbbell Press", "Shoulders", "Dumbbell", "beginner", "compound", "push", {
    sec: ["Triceps"],
    d: "Back-supported overhead press for strict, heavy delt work.",
  }),
  x("arnold-press", "Arnold Press", "Shoulders", "Dumbbell", "intermediate", "compound", "push", {
    sec: ["Triceps"],
    d: "Rotating press that sweeps through all three delt heads.",
  }),
  x("machine-shoulder-press", "Machine Shoulder Press", "Shoulders", "Machine", "beginner", "compound", "push", {
    sec: ["Triceps"],
    d: "Guided overhead press — safe to push hard without a spotter.",
  }),
  x("push-press", "Push Press", "Shoulders", "Barbell", "intermediate", "compound", "push", {
    sec: ["Triceps", "Quads", "Core"],
    d: "Leg-drive assisted overhead press — overload the delts beyond strict weight.",
    reps: "3–6", rest: 180,
  }),
  x("lateral-raise", "Lateral Raise", "Shoulders", "Dumbbell", "beginner", "isolation", "push", {
    aka: ["Side Raise"],
    d: "The side-delt builder — the key to wider shoulders.",
    steps: ["Slight lean forward, soft elbows.", "Lead with the elbows out to shoulder height.", "Lower slower than you lifted."],
    mistakes: ["Swinging with the hips.", "Shrugging the traps into the movement.", "Raising above shoulder height."],
    reps: "12–20", rest: 60,
  }),
  x("cable-lateral-raise", "Cable Lateral Raise", "Shoulders", "Cable", "beginner", "isolation", "push", {
    d: "Lateral raise with tension from the very bottom of the arc.",
    reps: "12–20", rest: 60,
  }),
  x("front-raise", "Front Raise", "Shoulders", "Dumbbell", "beginner", "isolation", "push", {
    d: "Isolates the front delts — a small dose goes a long way.",
    reps: "12–15", rest: 60,
  }),
  x("plate-front-raise", "Plate Front Raise", "Shoulders", "Plate", "beginner", "isolation", "push", {
    d: "Two-hand plate raise for front delts and upper chest.",
    reps: "12–15", rest: 60,
  }),
  x("rear-delt-fly", "Rear Delt Fly", "Shoulders", "Dumbbell", "beginner", "isolation", "pull", {
    sec: ["Back"], aka: ["Reverse Fly", "Bent-Over Fly"],
    d: "Bent-over fly for the neglected rear delts.",
    reps: "12–20", rest: 60,
  }),
  x("reverse-pec-deck", "Reverse Pec Deck", "Shoulders", "Machine", "beginner", "isolation", "pull", {
    sec: ["Back"],
    d: "Machine rear-delt fly — strict and easy to progress.",
    reps: "12–20", rest: 60,
  }),
  x("face-pull", "Face Pull", "Shoulders", "Cable", "beginner", "isolation", "pull", {
    sec: ["Traps", "Back"],
    d: "High rope pull to the face — rear delts, external rotators, posture insurance.",
    steps: ["Rope at upper-chest height.", "Pull toward the forehead, elbows high.", "Finish in a 'double biceps' position."],
    reps: "12–20", rest: 60,
  }),
  x("upright-row", "Upright Row", "Shoulders", "Barbell", "intermediate", "compound", "pull", {
    sec: ["Traps", "Biceps"],
    d: "Vertical pull along the body for delts and traps — keep the grip wide-ish.",
    mistakes: ["Pulling too high or too narrow, pinching the shoulder."],
  }),
  x("band-pull-apart", "Band Pull-Apart", "Shoulders", "Band", "beginner", "isolation", "pull", {
    sec: ["Traps", "Back"],
    d: "Horizontal band pull for rear delts — perfect between pressing sets.",
    reps: "15–25", rest: 30,
  }),
  x("cable-external-rotation", "Cable External Rotation", "Shoulders", "Cable", "beginner", "isolation", "rotation", {
    d: "Rotator-cuff strengthener — cheap insurance for pressing shoulders.",
    reps: "12–15", rest: 45,
  }),
  x("pike-push-up", "Pike Push-Up", "Shoulders", "Bodyweight", "intermediate", "compound", "push", {
    sec: ["Triceps"],
    d: "Hips-high push-up that shifts the load onto the shoulders.",
  }),
  x("handstand-push-up", "Handstand Push-Up", "Shoulders", "Bodyweight", "advanced", "compound", "push", {
    sec: ["Triceps", "Core"],
    d: "Wall-supported vertical pressing with your bodyweight — elite shoulder strength.",
    reps: "3–8", rest: 180,
  }),

  /* ============================== TRAPS ============================== */
  x("shrug", "Barbell Shrug", "Traps", "Barbell", "beginner", "isolation", "pull", {
    d: "Straight up-and-down shrug — heavy, simple trap growth.",
    mistakes: ["Rolling the shoulders — straight up, pause, straight down."],
    reps: "10–15", rest: 90,
  }),
  x("db-shrug", "Dumbbell Shrug", "Traps", "Dumbbell", "beginner", "isolation", "pull", {
    d: "Shrugs with a longer range and neutral grip at the sides.",
    reps: "10–15", rest: 90,
  }),
  x("cable-shrug", "Cable Shrug", "Traps", "Cable", "beginner", "isolation", "pull", {
    d: "Constant-tension shrugging from a low pulley.",
    reps: "12–15", rest: 60,
  }),

  /* ============================== BICEPS ============================== */
  x("barbell-curl", "Barbell Curl", "Biceps", "Barbell", "beginner", "isolation", "pull", {
    sec: ["Forearms"],
    d: "The benchmark biceps builder — load both arms as one unit.",
    steps: ["Grip shoulder width, elbows pinned to the sides.", "Curl without swinging; squeeze at the top.", "Lower for a slow two-count."],
    mistakes: ["Rocking the torso.", "Letting the elbows drift forward."],
  }),
  x("ez-bar-curl", "EZ-Bar Curl", "Biceps", "EZ Bar", "beginner", "isolation", "pull", {
    sec: ["Forearms"],
    d: "Angled-grip curling that spares the wrists.",
  }),
  x("db-curl", "Dumbbell Curl", "Biceps", "Dumbbell", "beginner", "isolation", "pull", {
    sec: ["Forearms"],
    d: "Alternating or together — free-rotation curls with full supination.",
  }),
  x("hammer-curl", "Hammer Curl", "Biceps", "Dumbbell", "beginner", "isolation", "pull", {
    sec: ["Forearms"],
    d: "Neutral-grip curl hitting the brachialis for arm thickness.",
  }),
  x("incline-db-curl", "Incline Dumbbell Curl", "Biceps", "Dumbbell", "intermediate", "isolation", "pull", {
    d: "Curling from a deep stretch on an incline bench.",
  }),
  x("preacher-curl", "Preacher Curl", "Biceps", "Machine", "beginner", "isolation", "pull", {
    d: "Arm-pad support removes all cheating — pure biceps.",
  }),
  x("concentration-curl", "Concentration Curl", "Biceps", "Dumbbell", "beginner", "isolation", "pull", {
    d: "Elbow braced on the thigh — strict peak contraction work.",
  }),
  x("spider-curl", "Spider Curl", "Biceps", "Dumbbell", "intermediate", "isolation", "pull", {
    d: "Curling vertically off the steep side of an incline bench — no rest at the bottom.",
  }),
  x("cable-curl", "Cable Curl", "Biceps", "Cable", "beginner", "isolation", "pull", {
    d: "Constant cable tension through the whole curl.",
  }),
  x("cable-hammer-curl", "Rope Hammer Curl", "Biceps", "Cable", "beginner", "isolation", "pull", {
    sec: ["Forearms"],
    d: "Rope-grip hammer curl — brachialis and forearms under cable tension.",
  }),
  x("zottman-curl", "Zottman Curl", "Biceps", "Dumbbell", "intermediate", "isolation", "pull", {
    sec: ["Forearms"],
    d: "Curl up supinated, lower pronated — biceps up, forearms down.",
  }),
  x("machine-curl", "Machine Curl", "Biceps", "Machine", "beginner", "isolation", "pull", {
    d: "Fixed-path curls — great for drop sets and burnouts.",
  }),
  x("drag-curl", "Drag Curl", "Biceps", "Barbell", "intermediate", "isolation", "pull", {
    d: "Bar dragged up the torso, elbows back — long-head emphasis.",
  }),

  /* ============================= TRICEPS ============================= */
  x("triceps-pushdown", "Triceps Pushdown", "Triceps", "Cable", "beginner", "isolation", "push", {
    aka: ["Cable Pushdown"],
    d: "The staple cable extension for triceps volume.",
    steps: ["Elbows pinned to the sides.", "Extend to full lockout and squeeze.", "Let the forearms come up past 90° without the elbows moving."],
    mistakes: ["Leaning over the weight and pressing with bodyweight."],
  }),
  x("rope-pushdown", "Rope Pushdown", "Triceps", "Cable", "beginner", "isolation", "push", {
    d: "Pushdown with a rope split at the bottom for a harder lockout.",
  }),
  x("single-arm-pushdown", "Single-Arm Pushdown", "Triceps", "Cable", "beginner", "isolation", "push", {
    d: "One arm at a time — evens out left/right pressing strength.",
  }),
  x("skull-crusher", "Skull Crusher", "Triceps", "EZ Bar", "intermediate", "isolation", "push", {
    aka: ["Lying Triceps Extension"],
    d: "Lying extension to the forehead — big stretch on the long head.",
    mistakes: ["Flaring the elbows wide.", "Bouncing at the bottom."],
  }),
  x("overhead-triceps-ext", "Overhead Triceps Extension", "Triceps", "Dumbbell", "beginner", "isolation", "push", {
    d: "Overhead stretch position for the long head of the triceps.",
  }),
  x("cable-overhead-ext", "Cable Overhead Extension", "Triceps", "Cable", "beginner", "isolation", "push", {
    d: "Overhead rope extension with constant tension in the stretch.",
  }),
  x("close-grip-bench", "Close-Grip Bench Press", "Triceps", "Barbell", "intermediate", "compound", "push", {
    sec: ["Chest", "Shoulders"],
    d: "Narrow-grip pressing — the heaviest way to load the triceps.",
  }),
  x("jm-press", "JM Press", "Triceps", "Barbell", "advanced", "compound", "push", {
    sec: ["Chest"],
    d: "Hybrid of close-grip bench and skull crusher for lockout strength.",
  }),
  x("triceps-dip", "Triceps Dip", "Triceps", "Bodyweight", "intermediate", "compound", "push", {
    sec: ["Chest", "Shoulders"],
    d: "Upright dip — bodyweight triceps mass on parallel bars.",
  }),
  x("bench-dip", "Bench Dip", "Triceps", "Bodyweight", "beginner", "compound", "push", {
    sec: ["Shoulders"],
    d: "Hands on a bench behind you — an accessible dip regression.",
  }),
  x("diamond-push-up", "Diamond Push-Up", "Triceps", "Bodyweight", "intermediate", "compound", "push", {
    sec: ["Chest", "Core"],
    d: "Hands-together push-up that shifts the work to the triceps.",
  }),
  x("triceps-kickback", "Triceps Kickback", "Triceps", "Dumbbell", "beginner", "isolation", "push", {
    d: "Hinged-over extension — light weight, hard peak contraction.",
    reps: "12–15", rest: 60,
  }),
  x("machine-triceps-ext", "Machine Triceps Extension", "Triceps", "Machine", "beginner", "isolation", "push", {
    d: "Seated machine extension — easy to load and drop-set.",
  }),

  /* ============================= FOREARMS ============================= */
  x("wrist-curl", "Wrist Curl", "Forearms", "Dumbbell", "beginner", "isolation", "pull", {
    d: "Palms-up wrist flexion for forearm size and grip.",
    reps: "15–20", rest: 45,
  }),
  x("reverse-wrist-curl", "Reverse Wrist Curl", "Forearms", "Dumbbell", "beginner", "isolation", "pull", {
    d: "Palms-down extension — balances the wrist and fights elbow pain.",
    reps: "15–20", rest: 45,
  }),
  x("reverse-curl", "Reverse Curl", "Forearms", "EZ Bar", "beginner", "isolation", "pull", {
    sec: ["Biceps"],
    d: "Overhand curl for the brachioradialis — thicker-looking forearms.",
  }),
  x("wrist-roller", "Wrist Roller", "Forearms", "Other", "beginner", "isolation", "pull", {
    d: "Roll a hanging weight up and down — a forearm pump like nothing else.",
    reps: "2–4 rolls", rest: 90,
  }),
  x("dead-hang", "Dead Hang", "Forearms", "Bodyweight", "beginner", "isolation", "isometric", {
    sec: ["Back", "Shoulders"],
    d: "Hang from a bar for time — grip endurance and a free shoulder stretch.",
    reps: "20–60s", rest: 90,
  }),
  x("plate-pinch", "Plate Pinch", "Forearms", "Plate", "beginner", "isolation", "isometric", {
    d: "Pinch smooth plates together for time — crushing thumb and grip strength.",
    reps: "20–40s", rest: 90,
  }),

  /* =============================== CORE =============================== */
  x("plank", "Plank", "Core", "Bodyweight", "beginner", "isolation", "isometric", {
    d: "The foundational anti-extension hold.",
    steps: ["Elbows under shoulders, feet together.", "Squeeze glutes and abs — one straight line.", "Breathe; don't let the hips sag or pike."],
    reps: "30–90s", rest: 60,
  }),
  x("plank-shoulder-tap", "Plank Shoulder Tap", "Core", "Bodyweight", "beginner", "isolation", "isometric", {
    sec: ["Shoulders"],
    d: "High plank while tapping shoulders — anti-rotation under fatigue.",
    reps: "10–20 taps", rest: 60,
  }),
  x("crunch", "Crunch", "Core", "Bodyweight", "beginner", "isolation", "core", {
    d: "Short-range spinal flexion — simple, effective ab work.",
  }),
  x("bicycle-crunch", "Bicycle Crunch", "Obliques", "Bodyweight", "beginner", "isolation", "rotation", {
    sec: ["Core"],
    d: "Alternating elbow-to-knee crunch — abs and obliques together.",
  }),
  x("reverse-crunch", "Reverse Crunch", "Core", "Bodyweight", "beginner", "isolation", "core", {
    d: "Curl the pelvis toward the ribs — lower-ab emphasis without neck strain.",
  }),
  x("sit-up", "Sit-Up", "Core", "Bodyweight", "beginner", "isolation", "core", {
    sec: ["Hip Flexors"],
    d: "Full-range trunk flexion off the floor.",
  }),
  x("decline-sit-up", "Decline Sit-Up", "Core", "Bodyweight", "intermediate", "isolation", "core", {
    sec: ["Hip Flexors"],
    d: "Sit-ups on a decline — easy to load with a plate on the chest.",
  }),
  x("cable-crunch", "Cable Crunch", "Core", "Cable", "beginner", "isolation", "core", {
    d: "Kneeling rope crunch — the easiest way to load the abs progressively.",
  }),
  x("hanging-leg-raise", "Hanging Leg Raise", "Core", "Bodyweight", "intermediate", "isolation", "core", {
    sec: ["Hip Flexors", "Forearms"],
    d: "Straight-leg raise from a bar — advanced lower-ab strength.",
    mistakes: ["Swinging the legs up with momentum."],
  }),
  x("hanging-knee-raise", "Hanging Knee Raise", "Core", "Bodyweight", "beginner", "isolation", "core", {
    sec: ["Hip Flexors"],
    d: "Knees-to-chest from a hang — the leg-raise regression.",
  }),
  x("toes-to-bar", "Toes-to-Bar", "Core", "Bodyweight", "advanced", "isolation", "core", {
    sec: ["Hip Flexors", "Forearms"],
    d: "Touch the bar with your toes — full-range hanging core strength.",
  }),
  x("leg-raise", "Lying Leg Raise", "Core", "Bodyweight", "beginner", "isolation", "core", {
    sec: ["Hip Flexors"],
    d: "Floor-based leg raise — keep the lower back pressed down.",
  }),
  x("flutter-kick", "Flutter Kicks", "Core", "Bodyweight", "beginner", "isolation", "core", {
    sec: ["Hip Flexors"],
    d: "Small alternating kicks — lower-ab endurance burner.",
    reps: "20–40s", rest: 45,
  }),
  x("v-up", "V-Up", "Core", "Bodyweight", "intermediate", "isolation", "core", {
    d: "Fold in half touching toes at the top — abs and hip flexors together.",
  }),
  x("hollow-hold", "Hollow Body Hold", "Core", "Bodyweight", "intermediate", "isolation", "isometric", {
    d: "Gymnastics staple — press the lower back down and hold the dish shape.",
    reps: "20–45s", rest: 60,
  }),
  x("dead-bug", "Dead Bug", "Core", "Bodyweight", "beginner", "isolation", "core", {
    d: "Opposite arm/leg reach while the trunk stays dead still.",
  }),
  x("bird-dog", "Bird Dog", "Core", "Bodyweight", "beginner", "isolation", "core", {
    sec: ["Lower Back", "Glutes"],
    d: "Quadruped opposite-limb reach — core stability plus back health.",
  }),
  x("ab-wheel", "Ab Wheel Rollout", "Core", "Other", "advanced", "isolation", "core", {
    sec: ["Lower Back", "Shoulders"],
    d: "Roll out, fight the sag, pull back — elite anti-extension strength.",
    mistakes: ["Letting the hips sag into an arched back."],
  }),
  x("stability-ball-rollout", "Stability Ball Rollout", "Core", "Other", "beginner", "isolation", "core", {
    d: "Rollouts on a ball — the friendlier route to the ab wheel.",
  }),
  x("l-sit", "L-Sit", "Core", "Bodyweight", "advanced", "isolation", "isometric", {
    sec: ["Hip Flexors", "Triceps"],
    d: "Legs held parallel to the floor on parallettes — brutal static strength.",
    reps: "10–30s", rest: 120,
  }),
  x("mountain-climber", "Mountain Climbers", "Core", "Bodyweight", "beginner", "compound", "cardio", {
    sec: ["Shoulders", "Hip Flexors"], cat: "cardio",
    d: "Fast alternating knee drives in a high plank — core plus conditioning.",
    reps: "20–40s", rest: 45,
  }),

  /* ============================= OBLIQUES ============================= */
  x("russian-twist", "Russian Twist", "Obliques", "Bodyweight", "beginner", "isolation", "rotation", {
    sec: ["Core"],
    d: "Seated rotation side to side — add a plate to progress.",
  }),
  x("side-plank", "Side Plank", "Obliques", "Bodyweight", "beginner", "isolation", "isometric", {
    sec: ["Core", "Abductors"],
    d: "Lateral trunk hold — obliques and hip stabilisers.",
    reps: "20–60s per side", rest: 45,
  }),
  x("woodchopper", "Cable Woodchopper", "Obliques", "Cable", "beginner", "compound", "rotation", {
    sec: ["Core", "Shoulders"],
    d: "Diagonal cable chop — rotational power through the trunk.",
  }),
  x("pallof-press", "Pallof Press", "Obliques", "Cable", "beginner", "isolation", "rotation", {
    sec: ["Core"],
    d: "Anti-rotation press-out — the core resists while the arms move.",
  }),
  x("side-bend", "Dumbbell Side Bend", "Obliques", "Dumbbell", "beginner", "isolation", "core", {
    d: "Lateral flexion with a single dumbbell — keep it strict and slow.",
  }),
  x("landmine-rotation", "Landmine Rotation", "Obliques", "Barbell", "intermediate", "compound", "rotation", {
    sec: ["Core", "Shoulders"],
    d: "Sweeping arc with a landmine bar — athletic rotational strength.",
  }),

  /* ============================ LOWER BACK ============================ */
  x("back-extension", "Back Extension", "Lower Back", "Bodyweight", "beginner", "isolation", "hinge", {
    sec: ["Glutes", "Hamstrings"], aka: ["Hyperextension"],
    d: "45° hip extension — builds the spinal erectors and glutes safely.",
  }),
  x("superman", "Superman Hold", "Lower Back", "Bodyweight", "beginner", "isolation", "isometric", {
    sec: ["Glutes"],
    d: "Lift chest and legs off the floor and hold — no-equipment back extension.",
    reps: "20–40s", rest: 45,
  }),
  x("reverse-hyperextension", "Reverse Hyperextension", "Lower Back", "Machine", "intermediate", "isolation", "hinge", {
    sec: ["Glutes", "Hamstrings"],
    d: "Legs swing up behind you — decompresses the spine while training it.",
  }),

  /* ============================== QUADS ============================== */
  x("squat", "Barbell Squat", "Quads", "Barbell", "intermediate", "compound", "squat", {
    sec: ["Glutes", "Hamstrings", "Core", "Lower Back"], aka: ["Back Squat"],
    d: "The king of lower-body lifts — total leg and trunk strength.",
    steps: ["Bar on the upper back, feet shoulder width.", "Big breath, brace, sit down between the hips.", "Break parallel with knees tracking the toes.", "Drive up through mid-foot, exhale at the top."],
    mistakes: ["Knees caving inward.", "Heels lifting off the floor.", "Chest collapsing forward."],
    tips: ["Grip the floor with your feet.", "Brace like you're about to be punched."],
  }),
  x("front-squat", "Front Squat", "Quads", "Barbell", "advanced", "compound", "squat", {
    sec: ["Core", "Glutes"],
    d: "Bar racked on the front delts — upright torso, maximum quad demand.",
    mistakes: ["Letting the elbows drop and the bar roll forward."],
  }),
  x("goblet-squat", "Goblet Squat", "Quads", "Kettlebell", "beginner", "compound", "squat", {
    sec: ["Glutes", "Core"],
    d: "Squat holding a weight at the chest — teaches perfect squat mechanics.",
  }),
  x("hack-squat", "Hack Squat", "Quads", "Machine", "intermediate", "compound", "squat", {
    sec: ["Glutes"],
    d: "Machine squat on a fixed track — deep, safe quad overload.",
  }),
  x("smith-squat", "Smith Machine Squat", "Quads", "Smith Machine", "beginner", "compound", "squat", {
    sec: ["Glutes"],
    d: "Squatting on a guided bar — stable and simple to load.",
  }),
  x("box-squat", "Box Squat", "Quads", "Barbell", "intermediate", "compound", "squat", {
    sec: ["Glutes", "Hamstrings"],
    d: "Squat to a box — controls depth and builds power out of the hole.",
  }),
  x("zercher-squat", "Zercher Squat", "Quads", "Barbell", "advanced", "compound", "squat", {
    sec: ["Core", "Glutes", "Biceps"],
    d: "Bar cradled in the elbows — savage upper-back and core demand.",
  }),
  x("leg-press", "Leg Press", "Quads", "Machine", "beginner", "compound", "squat", {
    sec: ["Glutes", "Hamstrings"],
    d: "Heavy leg pressing with the back supported — quad size without spinal load.",
    mistakes: ["Cutting depth with too much weight.", "Locking the knees hard at the top."],
  }),
  x("lunge", "Walking Lunge", "Quads", "Dumbbell", "beginner", "compound", "lunge", {
    sec: ["Glutes", "Hamstrings", "Core"],
    d: "Alternating forward strides — legs, balance, and conditioning at once.",
    mistakes: ["Short steps that slam the knee past the toes.", "Pushing off the back foot instead of the front heel."],
  }),
  x("reverse-lunge", "Reverse Lunge", "Quads", "Dumbbell", "beginner", "compound", "lunge", {
    sec: ["Glutes"],
    d: "Stepping backward — knee-friendlier than forward lunges.",
  }),
  x("split-squat", "Split Squat", "Quads", "Dumbbell", "beginner", "compound", "lunge", {
    sec: ["Glutes"],
    d: "Static lunge stance — the entry point for single-leg strength.",
  }),
  x("bulgarian-split-squat", "Bulgarian Split Squat", "Quads", "Dumbbell", "intermediate", "compound", "lunge", {
    sec: ["Glutes", "Core"],
    d: "Rear-foot-elevated split squat — the single-leg mass builder everyone loves to hate.",
    steps: ["Rear foot on a bench, front foot well forward.", "Drop the back knee straight down.", "Drive up through the front heel."],
    mistakes: ["Front foot too close to the bench.", "Bouncing out of the bottom."],
  }),
  x("step-up", "Dumbbell Step-Up", "Quads", "Dumbbell", "beginner", "compound", "lunge", {
    sec: ["Glutes"],
    d: "Step onto a box, drive through the top leg — don't push off the floor.",
  }),
  x("leg-extension", "Leg Extension", "Quads", "Machine", "beginner", "isolation", "squat", {
    d: "Machine knee extension — direct quad isolation and a wicked pump.",
    reps: "12–20", rest: 60,
  }),
  x("sissy-squat", "Sissy Squat", "Quads", "Bodyweight", "advanced", "isolation", "squat", {
    d: "Knees travel far forward as you lean back — extreme quad stretch under load.",
  }),
  x("pistol-squat", "Pistol Squat", "Quads", "Bodyweight", "advanced", "compound", "squat", {
    sec: ["Glutes", "Core"],
    d: "Full single-leg squat — strength, mobility and balance in one rep.",
    reps: "3–8 per side", rest: 120,
  }),
  x("wall-sit", "Wall Sit", "Quads", "Bodyweight", "beginner", "isolation", "isometric", {
    d: "Static 90° hold against a wall — quad endurance for time.",
    reps: "30–90s", rest: 60,
  }),

  /* ============================ HAMSTRINGS ============================ */
  x("romanian-deadlift", "Romanian Deadlift", "Hamstrings", "Barbell", "intermediate", "compound", "hinge", {
    sec: ["Glutes", "Lower Back"], aka: ["RDL"],
    d: "The hip hinge for hamstring size — stretch, don't touch the floor.",
    steps: ["Soft knees, push the hips straight back.", "Bar slides down the thighs, back flat.", "Feel the hamstring stretch, then drive the hips through."],
    mistakes: ["Bending the knees into a squat.", "Rounding the back to chase depth."],
  }),
  x("stiff-leg-deadlift", "Stiff-Leg Deadlift", "Hamstrings", "Barbell", "intermediate", "compound", "hinge", {
    sec: ["Glutes", "Lower Back"],
    d: "Straighter-knee deadlift with a longer stretch than the RDL.",
  }),
  x("single-leg-rdl", "Single-Leg RDL", "Hamstrings", "Dumbbell", "intermediate", "compound", "hinge", {
    sec: ["Glutes", "Core"],
    d: "One-leg hinge — hamstrings plus serious balance work.",
  }),
  x("leg-curl", "Leg Curl", "Hamstrings", "Machine", "beginner", "isolation", "hinge", {
    aka: ["Lying Leg Curl"],
    d: "Machine knee flexion — the direct hamstring isolator.",
    reps: "10–15", rest: 75,
  }),
  x("seated-leg-curl", "Seated Leg Curl", "Hamstrings", "Machine", "beginner", "isolation", "hinge", {
    d: "Seated curl trains the hamstrings at longer muscle lengths — great for growth.",
    reps: "10–15", rest: 75,
  }),
  x("nordic-curl", "Nordic Hamstring Curl", "Hamstrings", "Bodyweight", "advanced", "isolation", "hinge", {
    d: "Lower yourself forward from kneeling — eccentric hamstring strength, injury-proofing.",
    reps: "3–8", rest: 120,
  }),
  x("glute-ham-raise", "Glute-Ham Raise", "Hamstrings", "Machine", "advanced", "compound", "hinge", {
    sec: ["Glutes", "Lower Back"],
    d: "GHD-bench curl — hamstrings and glutes through their full function.",
  }),
  x("swiss-ball-leg-curl", "Swiss Ball Leg Curl", "Hamstrings", "Other", "beginner", "isolation", "hinge", {
    sec: ["Glutes", "Core"],
    d: "Bridge and curl a stability ball in — hamstrings with no machine needed.",
  }),
  x("good-morning", "Good Morning", "Hamstrings", "Barbell", "advanced", "compound", "hinge", {
    sec: ["Lower Back", "Glutes"],
    d: "Barbell-on-back hip hinge — posterior chain with a strict brace.",
    mistakes: ["Going heavy before the hinge pattern is solid."],
  }),

  /* ============================== GLUTES ============================== */
  x("hip-thrust", "Hip Thrust", "Glutes", "Barbell", "intermediate", "compound", "hinge", {
    sec: ["Hamstrings", "Quads"],
    d: "Shoulders on a bench, bar over the hips — the heaviest direct glute exercise.",
    steps: ["Upper back on a bench, bar padded over the hips.", "Drive through the heels to full hip lockout.", "Chin tucked, ribs down — squeeze for a beat at the top."],
    mistakes: ["Arching the lower back instead of extending the hips."],
  }),
  x("glute-bridge", "Glute Bridge", "Glutes", "Bodyweight", "beginner", "compound", "hinge", {
    sec: ["Hamstrings"],
    d: "Floor-based hip extension — the hip-thrust starting point.",
  }),
  x("single-leg-glute-bridge", "Single-Leg Glute Bridge", "Glutes", "Bodyweight", "beginner", "compound", "hinge", {
    sec: ["Hamstrings", "Core"],
    d: "One-leg bridging to expose and fix side-to-side gaps.",
  }),
  x("cable-pull-through", "Cable Pull-Through", "Glutes", "Cable", "beginner", "compound", "hinge", {
    sec: ["Hamstrings"],
    d: "Face away from a low rope and hinge — teaches the hip snap safely.",
  }),
  x("cable-kickback", "Cable Glute Kickback", "Glutes", "Cable", "beginner", "isolation", "hinge", {
    d: "Ankle-cuff kickbacks — strict single-leg glute isolation.",
    reps: "12–20", rest: 60,
  }),
  x("sumo-squat", "Sumo Squat", "Glutes", "Dumbbell", "beginner", "compound", "squat", {
    sec: ["Quads", "Adductors"],
    d: "Wide-stance squat holding one weight — glutes and inner thighs.",
  }),
  x("curtsy-lunge", "Curtsy Lunge", "Glutes", "Dumbbell", "intermediate", "compound", "lunge", {
    sec: ["Quads", "Abductors"],
    d: "Cross-behind lunge that loads the glute medius.",
  }),
  x("frog-pump", "Frog Pump", "Glutes", "Bodyweight", "beginner", "isolation", "hinge", {
    d: "Soles together, pump the hips — high-rep glute finisher.",
    reps: "20–30", rest: 45,
  }),
  x("donkey-kick", "Donkey Kick", "Glutes", "Bodyweight", "beginner", "isolation", "hinge", {
    d: "Quadruped kickback — squeeze the glute at the top of every rep.",
    reps: "15–20 per side", rest: 45,
  }),

  /* ============================== CALVES ============================== */
  x("calf-raise", "Standing Calf Raise", "Calves", "Machine", "beginner", "isolation", "squat", {
    d: "Straight-leg raises for the gastrocnemius — full stretch, full squeeze.",
    tips: ["Pause 2s in the stretched bottom position — that's where growth lives."],
    reps: "10–15", rest: 60,
  }),
  x("seated-calf-raise", "Seated Calf Raise", "Calves", "Machine", "beginner", "isolation", "squat", {
    d: "Bent-knee raises that target the deeper soleus.",
    reps: "12–20", rest: 60,
  }),
  x("leg-press-calf-raise", "Leg Press Calf Raise", "Calves", "Machine", "beginner", "isolation", "squat", {
    d: "Calf pressing on the leg press sled — easy heavy loading.",
    reps: "10–15", rest: 60,
  }),
  x("single-leg-calf-raise", "Single-Leg Calf Raise", "Calves", "Bodyweight", "beginner", "isolation", "squat", {
    d: "One leg off a step — balances both calves and doubles the load.",
    reps: "10–15 per side", rest: 60,
  }),
  x("tibialis-raise", "Tibialis Raise", "Calves", "Bodyweight", "beginner", "isolation", "squat", {
    d: "Toes-up raises against a wall — bulletproof shins and ankles.",
    reps: "15–25", rest: 45,
  }),

  /* ======================= ADDUCTORS / ABDUCTORS ======================= */
  x("hip-adduction-machine", "Hip Adduction Machine", "Adductors", "Machine", "beginner", "isolation", "squat", {
    d: "Squeeze the pads together — direct inner-thigh strength.",
    reps: "12–15", rest: 60,
  }),
  x("copenhagen-plank", "Copenhagen Plank", "Adductors", "Bodyweight", "advanced", "isolation", "isometric", {
    sec: ["Obliques", "Core"],
    d: "Side plank with the top leg on a bench — elite adductor strength, groin injury insurance.",
    reps: "15–30s per side", rest: 60,
  }),
  x("lateral-lunge", "Lateral Lunge", "Adductors", "Dumbbell", "beginner", "compound", "lunge", {
    sec: ["Quads", "Glutes"],
    d: "Side-stepping lunge — strength through the frontal plane.",
  }),
  x("hip-abduction-machine", "Hip Abduction Machine", "Abductors", "Machine", "beginner", "isolation", "squat", {
    sec: ["Glutes"],
    d: "Press the pads apart — glute medius for hip stability.",
    reps: "12–20", rest: 60,
  }),
  x("banded-lateral-walk", "Banded Lateral Walk", "Abductors", "Band", "beginner", "isolation", "lunge", {
    sec: ["Glutes"],
    d: "Side steps against a band — wakes up the glute med before leg day.",
    reps: "10–15 steps per side", rest: 45,
  }),
  x("clamshell", "Clamshell", "Abductors", "Band", "beginner", "isolation", "rotation", {
    sec: ["Glutes"],
    d: "Side-lying knee openers — targeted hip stabiliser activation.",
    reps: "15–20 per side", rest: 30,
  }),

  /* ==================== HIP FLEXORS / NECK ==================== */
  x("psoas-march", "Psoas March", "Hip Flexors", "Band", "beginner", "isolation", "core", {
    sec: ["Core"],
    d: "Banded alternating knee drives lying down — direct hip-flexor strength.",
    reps: "10–15 per side", rest: 45,
  }),
  x("standing-knee-raise", "Weighted Knee Raise", "Hip Flexors", "Other", "beginner", "isolation", "core", {
    sec: ["Core"],
    d: "Standing knee drive against ankle weight or band.",
    reps: "12–15 per side", rest: 45,
  }),
  x("neck-flexion", "Neck Flexion", "Neck", "Plate", "beginner", "isolation", "core", {
    d: "Chin-to-chest against light plate resistance — build the front of the neck slowly.",
    reps: "15–20", rest: 60,
  }),
  x("neck-extension", "Neck Extension", "Neck", "Plate", "beginner", "isolation", "core", {
    d: "Head-back raises lying prone — a thicker, more resilient neck.",
    reps: "15–20", rest: 60,
  }),

  /* ============================ FULL BODY ============================ */
  x("kettlebell-swing", "Kettlebell Swing", "Full Body", "Kettlebell", "intermediate", "compound", "hinge", {
    sec: ["Glutes", "Hamstrings", "Core", "Shoulders"],
    d: "Ballistic hip hinge — power, conditioning and posterior chain in one bell.",
    steps: ["Hike the bell back like a football snap.", "Snap the hips forward — the arms are just ropes.", "Let it float to chest height, then ride it back."],
    mistakes: ["Squatting the swing instead of hinging.", "Lifting with the arms."],
    reps: "10–20", rest: 90,
  }),
  x("clean-and-press", "Clean & Press", "Full Body", "Barbell", "advanced", "compound", "olympic", {
    sec: ["Shoulders", "Quads", "Glutes"],
    d: "Floor to overhead in two beats — strength with full-body coordination.",
  }),
  x("thruster", "Dumbbell Thruster", "Full Body", "Dumbbell", "intermediate", "compound", "squat", {
    sec: ["Shoulders", "Quads", "Core"],
    d: "Front squat straight into a push press — a lungs-and-legs crusher.",
    reps: "8–15", rest: 120,
  }),
  x("burpee", "Burpee", "Full Body", "Bodyweight", "beginner", "compound", "cardio", {
    sec: ["Chest", "Quads", "Core"], cat: "cardio",
    d: "Down, push-up, jump — the conditioning move you love to hate.",
    reps: "8–15", rest: 60,
  }),
  x("farmers-carry", "Farmer's Carry", "Full Body", "Dumbbell", "beginner", "compound", "carry", {
    sec: ["Forearms", "Traps", "Core"],
    d: "Pick up heavy, walk tall — grip, traps and trunk in one drill.",
    reps: "20–40m", rest: 120,
  }),
  x("suitcase-carry", "Suitcase Carry", "Full Body", "Kettlebell", "beginner", "compound", "carry", {
    sec: ["Obliques", "Forearms", "Core"],
    d: "One-sided carry — the obliques fight the lean every step.",
    reps: "20–40m per side", rest: 90,
  }),
  x("turkish-get-up", "Turkish Get-Up", "Full Body", "Kettlebell", "advanced", "compound", "carry", {
    sec: ["Shoulders", "Core", "Glutes"],
    d: "Floor to standing with a weight locked overhead — total-body control.",
    reps: "2–5 per side", rest: 120,
  }),
  x("db-snatch", "Dumbbell Snatch", "Full Body", "Dumbbell", "intermediate", "compound", "olympic", {
    sec: ["Shoulders", "Glutes", "Hamstrings"],
    d: "One-arm floor-to-overhead in a single pull — explosive and simple to learn.",
    reps: "5–8 per side", rest: 120,
  }),
  x("kb-clean", "Kettlebell Clean", "Full Body", "Kettlebell", "intermediate", "compound", "olympic", {
    sec: ["Biceps", "Core", "Glutes"],
    d: "Hip-powered rack position catch — the gateway to kettlebell flows.",
    reps: "5–10 per side", rest: 90,
  }),
  x("man-maker", "Man Maker", "Full Body", "Dumbbell", "advanced", "compound", "cardio", {
    sec: ["Chest", "Back", "Shoulders", "Quads"], cat: "cardio",
    d: "Push-up, double row, clean, thruster — one rep, everything taxed.",
    reps: "5–10", rest: 120,
  }),
  x("renegade-row", "Renegade Row", "Full Body", "Dumbbell", "intermediate", "compound", "pull", {
    sec: ["Back", "Core", "Chest"],
    d: "Rowing from a push-up plank — anti-rotation meets upper-body pulling.",
    reps: "6–10 per side", rest: 90,
  }),
  x("bear-crawl", "Bear Crawl", "Full Body", "Bodyweight", "beginner", "compound", "carry", {
    sec: ["Shoulders", "Core", "Quads"],
    d: "Crawl with knees an inch off the floor — shoulders and trunk under travel.",
    reps: "20–40s", rest: 60,
  }),
  x("sled-push", "Sled Push", "Full Body", "Sled", "beginner", "compound", "carry", {
    sec: ["Quads", "Glutes", "Calves"],
    d: "Drive a loaded sled — leg power with zero eccentric soreness.",
    reps: "15–30m", rest: 120,
  }),
  x("sled-drag", "Sled Drag", "Full Body", "Sled", "beginner", "compound", "carry", {
    sec: ["Hamstrings", "Glutes", "Back"],
    d: "Walk backward or forward dragging the sled — conditioning that spares the joints.",
    reps: "15–30m", rest: 120,
  }),
  x("wall-ball", "Wall Ball", "Full Body", "Medicine Ball", "beginner", "compound", "squat", {
    sec: ["Quads", "Shoulders"], cat: "cardio",
    d: "Squat and throw to a target — a CrossFit conditioning staple.",
    reps: "10–20", rest: 90,
  }),
  x("med-ball-slam", "Medicine Ball Slam", "Full Body", "Medicine Ball", "beginner", "compound", "plyo", {
    sec: ["Core", "Shoulders", "Back"],
    d: "Overhead slam into the floor — power output and stress relief.",
    reps: "8–12", rest: 90,
  }),
  x("devil-press", "Devil Press", "Full Body", "Dumbbell", "advanced", "compound", "cardio", {
    sec: ["Shoulders", "Quads", "Core"], cat: "cardio",
    d: "Burpee over dumbbells into a double snatch — an engine builder.",
    reps: "5–10", rest: 120,
  }),

  /* ============================= OLYMPIC ============================= */
  x("power-clean", "Power Clean", "Olympic", "Barbell", "advanced", "compound", "olympic", {
    sec: ["Glutes", "Hamstrings", "Traps", "Quads"],
    d: "Explosive pull from floor to shoulders, caught high — pure power.",
    steps: ["Set up like a deadlift, bar close.", "Drive hard through the floor, then jump-shrug.", "Whip the elbows around and catch on the delts.", "Stand and reset every rep."],
    mistakes: ["Arm-pulling early instead of finishing the hips.", "Catching with the elbows down."],
  }),
  x("hang-clean", "Hang Clean", "Olympic", "Barbell", "advanced", "compound", "olympic", {
    sec: ["Glutes", "Traps", "Quads"],
    d: "Clean from above the knee — teaches the violent hip finish.",
  }),
  x("clean-and-jerk", "Clean & Jerk", "Olympic", "Barbell", "advanced", "compound", "olympic", {
    sec: ["Shoulders", "Quads", "Glutes"],
    d: "The Olympic total-body lift — floor to overhead in two movements.",
  }),
  x("snatch", "Snatch", "Olympic", "Barbell", "advanced", "compound", "olympic", {
    sec: ["Shoulders", "Glutes", "Core"],
    d: "Floor to overhead in one continuous pull — the fastest lift in sport.",
  }),
  x("power-snatch", "Power Snatch", "Olympic", "Barbell", "advanced", "compound", "olympic", {
    sec: ["Shoulders", "Glutes", "Hamstrings"],
    d: "Snatch caught above parallel — power without the deep overhead squat.",
  }),
  x("push-jerk", "Push Jerk", "Olympic", "Barbell", "advanced", "compound", "olympic", {
    sec: ["Shoulders", "Triceps", "Quads"],
    d: "Dip-drive the bar overhead and catch with bent knees.",
  }),
  x("high-pull", "Snatch-Grip High Pull", "Olympic", "Barbell", "intermediate", "compound", "olympic", {
    sec: ["Traps", "Glutes", "Hamstrings"],
    d: "Explosive wide-grip pull to the chest — trap and hip power without the catch.",
  }),

  /* ============================== CARDIO ============================== */
  x("treadmill-run", "Treadmill Run", "Cardio", "Machine", "beginner", "compound", "cardio", {
    sec: ["Quads", "Calves"],
    d: "Steady-state or interval running with full pace control.",
  }),
  x("incline-walk", "Incline Treadmill Walk", "Cardio", "Machine", "beginner", "compound", "cardio", {
    sec: ["Glutes", "Calves"],
    d: "Steep walking — zone-2 cardio that spares the knees.",
    reps: "20–40 min", rest: 0,
  }),
  x("sprint-intervals", "Sprint Intervals", "Cardio", "Bodyweight", "advanced", "compound", "cardio", {
    sec: ["Hamstrings", "Glutes", "Quads"], aka: ["HIIT Sprints"],
    d: "All-out sprints with full recoveries — maximum conditioning stimulus per minute.",
    reps: "6–10 × 15–30s", rest: 90,
  }),
  x("shuttle-run", "Shuttle Runs", "Cardio", "Bodyweight", "intermediate", "compound", "cardio", {
    sec: ["Quads", "Calves"],
    d: "Repeated line-to-line sprints with hard direction changes.",
    reps: "5–10 rounds", rest: 60,
  }),
  x("rowing-machine", "Rowing Machine", "Cardio", "Machine", "beginner", "compound", "cardio", {
    sec: ["Back", "Quads", "Biceps"], aka: ["Erg", "Row Erg"],
    d: "Full-body pulling cardio — legs, hips, then arms every stroke.",
  }),
  x("assault-bike", "Air Bike", "Cardio", "Machine", "intermediate", "compound", "cardio", {
    sec: ["Quads", "Shoulders"], aka: ["Assault Bike", "Echo Bike"],
    d: "Arms-and-legs fan bike — the harder you go, the harder it fights.",
    reps: "10–20 min or intervals", rest: 60,
  }),
  x("stationary-bike", "Stationary Bike", "Cardio", "Machine", "beginner", "compound", "cardio", {
    sec: ["Quads"],
    d: "Low-impact cycling — easy steady-state volume.",
  }),
  x("stair-climber", "Stair Climber", "Cardio", "Machine", "beginner", "compound", "cardio", {
    sec: ["Glutes", "Calves"],
    d: "Endless stairs — glute-biased cardio with a big burn.",
  }),
  x("elliptical", "Elliptical", "Cardio", "Machine", "beginner", "compound", "cardio", {
    sec: ["Quads", "Glutes"],
    d: "Smooth full-body cardio with near-zero impact.",
  }),
  x("ski-erg", "Ski Erg", "Cardio", "Machine", "intermediate", "compound", "cardio", {
    sec: ["Back", "Core", "Triceps"],
    d: "Double-pole pulling cardio — lats and lungs together.",
  }),
  x("jump-rope", "Jump Rope", "Cardio", "Other", "beginner", "compound", "cardio", {
    sec: ["Calves", "Shoulders"],
    d: "Rhythm, footwork and conditioning with a $10 tool.",
    reps: "5–15 min", rest: 60,
  }),
  x("jumping-jack", "Jumping Jacks", "Cardio", "Bodyweight", "beginner", "compound", "cardio", {
    sec: ["Calves", "Shoulders"],
    d: "The classic warm-up pulse raiser.",
    reps: "30–60s", rest: 30,
  }),
  x("high-knees", "High Knees", "Cardio", "Bodyweight", "beginner", "compound", "cardio", {
    sec: ["Hip Flexors", "Calves"],
    d: "Sprint on the spot driving the knees to hip height.",
    reps: "20–40s", rest: 30,
  }),
  x("battle-ropes", "Battle Ropes", "Cardio", "Other", "intermediate", "compound", "cardio", {
    sec: ["Shoulders", "Core", "Forearms"],
    d: "Violent rope waves — upper-body conditioning intervals.",
    reps: "20–30s on", rest: 40,
  }),
  x("swimming", "Swimming", "Cardio", "Bodyweight", "intermediate", "compound", "cardio", {
    sec: ["Back", "Shoulders", "Core"],
    d: "Zero-impact full-body endurance in the pool.",
  }),

  /* ============================ PLYOMETRIC ============================ */
  x("box-jump", "Box Jump", "Cardio", "Box", "intermediate", "compound", "plyo", {
    sec: ["Quads", "Glutes", "Calves"],
    d: "Explosive jump to a box — land soft, step down.",
    mistakes: ["Jumping down off the box — that's where injuries happen."],
  }),
  x("broad-jump", "Broad Jump", "Cardio", "Bodyweight", "intermediate", "compound", "plyo", {
    sec: ["Glutes", "Hamstrings", "Quads"],
    d: "Maximum horizontal jump — raw hip power.",
  }),
  x("jump-squat", "Jump Squat", "Cardio", "Bodyweight", "intermediate", "compound", "plyo", {
    sec: ["Quads", "Glutes", "Calves"],
    d: "Squat down, explode up — leg power with just bodyweight.",
  }),
  x("depth-jump", "Depth Jump", "Cardio", "Box", "advanced", "compound", "plyo", {
    sec: ["Quads", "Calves"],
    d: "Step off a box and rebound instantly — advanced reactive power.",
    reps: "3–5", rest: 150,
  }),

  /* ======================= MOBILITY / STRETCHING ======================= */
  x("worlds-greatest-stretch", "World's Greatest Stretch", "Mobility", "Bodyweight", "beginner", "compound", "mobility", {
    sec: ["Hip Flexors", "Hamstrings"],
    d: "Lunge, rotate, reach — hips, hamstrings and t-spine in one flow.",
  }),
  x("couch-stretch", "Couch Stretch", "Mobility", "Bodyweight", "beginner", "isolation", "stretch", {
    sec: ["Hip Flexors", "Quads"],
    d: "Rear foot up a wall in a lunge — the antidote to sitting all day.",
  }),
  x("pigeon-pose", "Pigeon Pose", "Mobility", "Bodyweight", "beginner", "isolation", "stretch", {
    sec: ["Glutes", "Hip Flexors"],
    d: "Deep external-rotation hip stretch from yoga.",
  }),
  x("90-90-hip", "90/90 Hip Switch", "Mobility", "Bodyweight", "beginner", "isolation", "mobility", {
    sec: ["Glutes", "Hip Flexors"],
    d: "Seated hip rotations between two 90° positions — internal and external rotation.",
  }),
  x("cossack-squat", "Cossack Squat", "Mobility", "Bodyweight", "intermediate", "compound", "mobility", {
    sec: ["Adductors", "Quads", "Glutes"],
    d: "Side-to-side deep squat shifts — strength through a huge range.",
    reps: "6–10 per side", rest: 60,
  }),
  x("cat-cow", "Cat-Cow", "Mobility", "Bodyweight", "beginner", "isolation", "mobility", {
    sec: ["Lower Back", "Core"],
    d: "Segmented spinal flexion and extension — a warm-up for any session.",
  }),
  x("thoracic-rotation", "Thoracic Rotation", "Mobility", "Bodyweight", "beginner", "isolation", "mobility", {
    sec: ["Obliques"],
    d: "Quadruped reach-throughs — unlock the upper back for pressing and squatting.",
  }),
  x("downward-dog", "Downward Dog", "Mobility", "Bodyweight", "beginner", "isolation", "stretch", {
    sec: ["Hamstrings", "Calves", "Shoulders"],
    d: "Inverted V hold — the whole posterior chain plus shoulders.",
  }),
  x("childs-pose", "Child's Pose", "Mobility", "Bodyweight", "beginner", "isolation", "stretch", {
    sec: ["Lower Back", "Shoulders"],
    d: "Kneeling reach forward — a gentle reset between hard sets.",
  }),
  x("hamstring-stretch", "Standing Hamstring Stretch", "Mobility", "Bodyweight", "beginner", "isolation", "stretch", {
    sec: ["Hamstrings"],
    d: "Heel elevated, hinge forward with a flat back.",
  }),
  x("doorway-chest-stretch", "Doorway Chest Stretch", "Mobility", "Bodyweight", "beginner", "isolation", "stretch", {
    sec: ["Chest", "Shoulders"],
    d: "Forearm on the frame, step through — opens pressing-day tightness.",
  }),
  x("ankle-dorsiflexion", "Ankle Dorsiflexion Drill", "Mobility", "Bodyweight", "beginner", "isolation", "mobility", {
    sec: ["Calves"],
    d: "Knee-over-toe rocks — the fix for squat depth limited by ankles.",
  }),
  x("foam-rolling", "Foam Rolling", "Mobility", "Other", "beginner", "isolation", "mobility", {
    d: "Slow rolls over tight tissue — 30–60 seconds per area before training.",
  }),
];

const byId = new Map(EXERCISES.map((e) => [e.id, e]));

export function getExercise(id) {
  return byId.get(id) || null;
}

/** Case-insensitive search across name, aliases and muscle. */
export function searchExercises(query) {
  const q = query.trim().toLowerCase();
  if (!q) return EXERCISES;
  return EXERCISES.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.muscle.toLowerCase().includes(q) ||
      e.aliases.some((a) => a.toLowerCase().includes(q))
  );
}
