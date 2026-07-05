const router = require("express").Router();
const controller = require("../controllers/progress.controller");
const requireAuth = require("../middlewares/auth");
const ownership = require("../middlewares/ownership");
const validate = require("../middlewares/validate");
const rules = require("../validators/progress.validators");
const { mongoId } = require("../validators/user.validators");
const upload = require("../middlewares/upload");
const ProgressPhoto = require("../models/ProgressPhoto");

router.use(requireAuth);

router.get("/", controller.listPhotos);
router.post("/", upload.single("image"), validate(rules.uploadPhoto), controller.uploadPhoto);
router.delete("/:id", validate(mongoId()), ownership(ProgressPhoto), controller.deletePhoto);

module.exports = router;
