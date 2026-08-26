const express = require("express");
const {
  getMeasurements,
  createMeasurement,
  getLatestMeasurement,
} = require("../controllers/measurementsController");

const router = express.Router();

router.get("/", getMeasurements);
router.get("/latest", getLatestMeasurement);
router.post("/", createMeasurement);

module.exports = router;
