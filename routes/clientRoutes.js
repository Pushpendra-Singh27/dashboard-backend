// routes/clientRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  getClientProjects,
  getClientProfile,
  getClientProjectDetails
} = require("../controllers/clientController");

const { clientLogin, logout } = require("../controllers/authController");

// Auth routes
router.post("/login", clientLogin);
router.post("/logout", logout);

// Protected client routes
router.get("/:clientId/projects", protect, getClientProjects);
router.get("/:clientId/profile", protect, getClientProfile);
router.get("/:clientId/projects/:projectId", protect, getClientProjectDetails);

module.exports = router;
