const express = require("express");
const {
  getMeasurements,
  createMeasurement,
} = require("../controllers/measurementsController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, getMeasurements);
router.post("/", authenticate, createMeasurement);

module.exports = router;
