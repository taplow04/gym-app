const router = require("express").Router();
const controller = require("../controllers/user.controller");
const requireAuth = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const rules = require("../validators/user.validators");
const upload = require("../middlewares/upload");
const { ROLES } = require("../constants");

router.use(requireAuth);

// ── Self ──
router.get("/me", controller.getMe);
router.patch("/me", validate(rules.updateMe), controller.updateMe);
router.patch("/me/preferences", validate(rules.updatePreferences), controller.updatePreferences);
router.patch("/profile-picture", upload.single("image"), controller.updateProfilePicture);
router.delete("/me", controller.deleteMe);

// ── Admin ──
router.get("/", authorize(ROLES.ADMIN), validate(rules.pagination), controller.listUsers);
router.get("/:id", authorize(ROLES.ADMIN), validate(rules.mongoId()), controller.getUser);
router.delete("/:id", authorize(ROLES.ADMIN), validate(rules.mongoId()), controller.deleteUser);

module.exports = router;
