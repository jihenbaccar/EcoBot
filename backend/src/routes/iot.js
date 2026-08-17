const express = require("express");
const { createMeasurementFromDevice } = require("../controllers/iotController");

const router = express.Router();

router.post("/measurements", createMeasurementFromDevice);

module.exports = router;
