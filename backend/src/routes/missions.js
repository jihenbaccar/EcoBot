const express = require("express");
const {
  getMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission,
} = require("../controllers/missionsController");
const { authenticate } = require("../middleware/auth");
const { requireSupervisor } = require("../middleware/role");

const router = express.Router();

router.get("/", authenticate, getMissions);
router.get("/:id", authenticate, getMissionById);
router.post("/", authenticate, requireSupervisor, createMission);
router.put("/:id", authenticate, requireSupervisor, updateMission);
router.delete("/:id", authenticate, requireSupervisor, deleteMission);

module.exports = router;
