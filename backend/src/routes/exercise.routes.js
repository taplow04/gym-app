const router = require("express").Router();
const controller = require("../controllers/exercise.controller");
const requireAuth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const rules = require("../validators/workout.validators");
const { mongoId } = require("../validators/user.validators");

router.use(requireAuth);

router.get("/", validate(rules.listExercises), controller.list);
router.post("/", validate(rules.createExercise), controller.create);
router.get("/:id", validate(mongoId()), controller.get);
router.patch("/:id", validate([...mongoId(), ...rules.updateExercise]), controller.update);
router.delete("/:id", validate(mongoId()), controller.remove);

module.exports = router;
