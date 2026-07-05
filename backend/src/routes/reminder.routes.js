const router = require("express").Router();
const controller = require("../controllers/reminder.controller");
const requireAuth = require("../middlewares/auth");
const ownership = require("../middlewares/ownership");
const validate = require("../middlewares/validate");
const rules = require("../validators/goal.validators");
const { mongoId } = require("../validators/user.validators");
const Reminder = require("../models/Reminder");

router.use(requireAuth);

router.get("/", controller.list);
router.post("/", validate(rules.createReminder), controller.create);
router.patch("/:id", validate([...mongoId(), ...rules.updateReminder]), ownership(Reminder), controller.update);
router.delete("/:id", validate(mongoId()), ownership(Reminder), controller.remove);

module.exports = router;
