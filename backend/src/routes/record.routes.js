const router = require("express").Router();
const controller = require("../controllers/progress.controller");
const requireAuth = require("../middlewares/auth");
const ownership = require("../middlewares/ownership");
const validate = require("../middlewares/validate");
const { mongoId } = require("../validators/user.validators");
const PersonalRecord = require("../models/PersonalRecord");

router.use(requireAuth);

router.get("/", controller.listRecords);
router.delete("/:id", validate(mongoId()), ownership(PersonalRecord), controller.deleteRecord);

module.exports = router;
