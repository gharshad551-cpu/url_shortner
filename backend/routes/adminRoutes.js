const express = require("express");
const router = express.Router();
const { getAdminStats } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { adminProtect } = require("../middleware/adminMiddleware");

router.get("/stats", protect, adminProtect, getAdminStats);

module.exports = router;
