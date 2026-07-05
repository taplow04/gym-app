const router = require("express").Router();
const controller = require("../controllers/workout.controller");
const requireAuth = require("../middlewares/auth");
const ownership = require("../middlewares/ownership");
const validate = require("../middlewares/validate");
const rules = require("../validators/workout.validators");
const { mongoId, pagination } = require("../validators/user.validators");
const WorkoutSession = require("../models/WorkoutSession");

router.use(requireAuth);

router.get("/", validate([...rules.listSessions, ...pagination]), controller.list);
router.get("/active", controller.getActive);
router.post("/", validate(rules.createSession), controller.create);
router.get("/:id", validate(mongoId()), ownership(WorkoutSession), controller.get);
router.patch("/:id", validate([...mongoId(), ...rules.updateSession]), ownership(WorkoutSession), controller.update);
router.post("/:id/complete", validate([...mongoId(), ...rules.updateSession]), ownership(WorkoutSession), controller.complete);
router.delete("/:id", validate(mongoId()), ownership(WorkoutSession), controller.remove);

module.exports = router;
