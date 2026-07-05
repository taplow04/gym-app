const router = require("express").Router();
const controller = require("../controllers/progress.controller");
const requireAuth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const rules = require("../validators/progress.validators");

router.use(requireAuth);

router.get("/overview", controller.overview);
router.get("/weekly", controller.weekly);
router.get("/monthly", controller.monthly);
router.get("/exercise", validate(rules.exerciseProgress), controller.exerciseProgress);
router.get("/weight", controller.weightHistory);

module.exports = router;
