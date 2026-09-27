const express = require("express");
const { authenticate } = require("../middleware/auth");
const {
  getNotifications,
  markNotificationsRead,
} = require("../controllers/notificationsController");

const router = express.Router();
router.use(authenticate);
router.get("/", getNotifications);
router.post("/read", markNotificationsRead);

module.exports = router;
