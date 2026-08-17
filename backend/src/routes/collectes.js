const express = require("express");
const {
  getCollectes,
  createCollecte,
} = require("../controllers/collectesController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, getCollectes);
router.post("/", authenticate, createCollecte);

module.exports = router;
