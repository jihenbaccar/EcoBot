const express = require("express");
const {
  getRobot,
  requestStatus,
  setSpeed,
} = require("../controllers/robotController");

const router = express.Router();
router.get("/:deviceId", getRobot);
router.post("/:deviceId/status", requestStatus);
router.post("/:deviceId/speed", setSpeed);

module.exports = router;
