const router = require("express").Router();
const controller = require("../controllers/notification.controller");
const requireAuth = require("../middlewares/auth");
const ownership = require("../middlewares/ownership");
const validate = require("../middlewares/validate");
const { mongoId, pagination } = require("../validators/user.validators");
const Notification = require("../models/Notification");

router.use(requireAuth);

router.get("/", validate(pagination), controller.list);
router.get("/unread-count", controller.unreadCount);
router.patch("/read-all", controller.markAllRead);
router.patch("/:id/read", validate(mongoId()), ownership(Notification), controller.markRead);
router.delete("/:id", validate(mongoId()), ownership(Notification), controller.remove);

module.exports = router;
