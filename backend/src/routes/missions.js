const express = require("express");
const {
  getMissions,
  getMissionById,
  createMission,
  updateMission,
  completeMission,
  updateMissionStatus,
  uploadMissionPhoto,
  reviewMission,
  deleteMissionPhoto,
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
router.post("/:id/complete", authenticate, completeMission);
router.post("/:id/status", authenticate, updateMissionStatus);
router.post("/:id/photos", authenticate, uploadMissionPhoto);
router.post("/:id/review", authenticate, requireSupervisor, reviewMission);
router.delete("/:id/photos/:photoId", authenticate, deleteMissionPhoto);

module.exports = router;
