const express = require("express");
const {
  getMissions,
  getMissionById,
  createMission,
  updateMission,
} = require("../controllers/missionsController");
const { authenticate } = require("../middleware/auth");
const { requireSupervisor } = require("../middleware/role");

const router = express.Router();

router.get("/", authenticate, getMissions);
router.get("/:id", authenticate, getMissionById);
router.post("/", authenticate, requireSupervisor, createMission);
router.put("/:id", authenticate, requireSupervisor, updateMission);

module.exports = router;
