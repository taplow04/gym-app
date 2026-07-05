const router = require("express").Router();
const controller = require("../controllers/progress.controller");
const requireAuth = require("../middlewares/auth");
const ownership = require("../middlewares/ownership");
const validate = require("../middlewares/validate");
const rules = require("../validators/progress.validators");
const { mongoId } = require("../validators/user.validators");
const Measurement = require("../models/Measurement");

router.use(requireAuth);

router.get("/", validate(rules.dateRange), controller.listMeasurements);
router.post("/", validate(rules.upsertMeasurement), controller.upsertMeasurement);
router.delete("/:id", validate(mongoId()), ownership(Measurement), controller.deleteMeasurement);

module.exports = router;
