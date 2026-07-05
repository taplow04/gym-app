const router = require("express").Router();
const controller = require("../controllers/plan.controller");
const requireAuth = require("../middlewares/auth");
const ownership = require("../middlewares/ownership");
const validate = require("../middlewares/validate");
const rules = require("../validators/workout.validators");
const { mongoId } = require("../validators/user.validators");
const WorkoutPlan = require("../models/WorkoutPlan");

router.use(requireAuth);

router.get("/", controller.list);
router.post("/", validate(rules.createPlan), controller.create);
router.get("/:id", validate(mongoId()), ownership(WorkoutPlan), controller.get);
router.patch("/:id", validate([...mongoId(), ...rules.updatePlan]), ownership(WorkoutPlan), controller.update);
router.post("/:id/activate", validate(mongoId()), ownership(WorkoutPlan), controller.activate);
router.delete("/:id", validate(mongoId()), ownership(WorkoutPlan), controller.remove);

module.exports = router;
