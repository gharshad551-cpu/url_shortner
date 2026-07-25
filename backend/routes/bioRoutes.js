const express = require("express");
const router = express.Router();
const bioController = require("../controllers/bioController");
const { protect } = require("../middleware/authMiddleware");

// Public endpoints
router.get("/public/:slug", bioController.getPublicBioPage);
router.post("/public/:slug/click/:linkId", bioController.trackLinkClick);

// Protected user endpoints
router.post("/", protect, bioController.createBioPage);
router.get("/my", protect, bioController.getUserBioPages);
router.put("/:id", protect, bioController.updateBioPage);
router.delete("/:id", protect, bioController.deleteBioPage);

module.exports = router;
