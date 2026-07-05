const router = require("express").Router();
const controller = require("../controllers/goal.controller");
const requireAuth = require("../middlewares/auth");
const ownership = require("../middlewares/ownership");
const validate = require("../middlewares/validate");
const rules = require("../validators/goal.validators");
const { mongoId } = require("../validators/user.validators");
const Goal = require("../models/Goal");

router.use(requireAuth);

router.get("/", controller.list);
router.post("/", validate(rules.createGoal), controller.create);
router.patch("/:id", validate([...mongoId(), ...rules.updateGoal]), ownership(Goal), controller.update);
router.delete("/:id", validate(mongoId()), ownership(Goal), controller.remove);

module.exports = router;
