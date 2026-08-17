const express = require("express");
const { getUsers, createUser } = require("../controllers/usersController");
const { authenticate } = require("../middleware/auth");
const { requireSupervisor } = require("../middleware/role");

const router = express.Router();

router.get("/", authenticate, requireSupervisor, getUsers);
router.post("/", authenticate, requireSupervisor, createUser);

module.exports = router;
