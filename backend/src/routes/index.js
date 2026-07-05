const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./user.routes"));
router.use("/exercises", require("./exercise.routes"));
router.use("/plans", require("./plan.routes"));
router.use("/workouts", require("./workout.routes"));
router.use("/measurements", require("./measurement.routes"));
router.use("/photos", require("./photo.routes"));
router.use("/records", require("./record.routes"));
router.use("/stats", require("./stats.routes"));
router.use("/goals", require("./goal.routes"));
router.use("/reminders", require("./reminder.routes"));
router.use("/notifications", require("./notification.routes"));

module.exports = router;
