// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  createNewAdmin,
  createNewClient,
  createNewProject,
  getAllClients,
  getAllProjects,
} = require("../controllers/adminController");

const { Adminlogin, logout } = require("../controllers/authController");

const { editClient } = require("../controllers/editClientController");

// Auth routes
router.post("/login", Adminlogin);
router.post("/logout", logout);
router.post("/create-admin", createNewAdmin);

// Protected admin actions
router.post("/create-admin", protect, createNewAdmin);
router.post("/create-client", protect, createNewClient);
router.post("/create-project", protect, createNewProject);

router.get("/clients", protect, getAllClients);
router.get("/projects", protect, getAllProjects);

router.patch("/edit-client/:clientId", protect, editClient);

module.exports = router;
