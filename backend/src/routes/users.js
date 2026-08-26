const express = require("express");
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/usersController");
const { authenticate } = require("../middleware/auth");
const { requireSupervisor } = require("../middleware/role");

const router = express.Router();

router.get("/", authenticate, requireSupervisor, getUsers);
router.post("/", authenticate, requireSupervisor, createUser);
router.put("/:id", authenticate, requireSupervisor, updateUser);
router.delete("/:id", authenticate, requireSupervisor, deleteUser);

module.exports = router;
