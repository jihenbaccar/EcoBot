const express = require("express");
const {
  getAspirateurs,
  getAspirateurById,
  createAspirateur,
  updateAspirateur,
  deleteAspirateur,
} = require("../controllers/aspirateursController");
const { authenticate } = require("../middleware/auth");
const { requireSupervisor } = require("../middleware/role");

const router = express.Router();

router.get("/", authenticate, getAspirateurs);
router.get("/:id", authenticate, getAspirateurById);
router.post("/", authenticate, requireSupervisor, createAspirateur);
router.put("/:id", authenticate, requireSupervisor, updateAspirateur);
router.delete("/:id", authenticate, requireSupervisor, deleteAspirateur);

module.exports = router;
