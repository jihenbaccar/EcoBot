const express = require("express");
const { getStatistics } = require("../controllers/statisticsController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, getStatistics);

module.exports = router;
