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
const { deleteClient } = require("../controllers/deleteClientController");
const { changeStatusOfClient } = require("../controllers/changeStatusOfClient");
const { editProject } = require("../controllers/editProjectController");
const { deleteProject } = require("../controllers/deleteProjectController");
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
router.delete("/delete/:clientId", protect, deleteClient);
router.patch("/change-status/:clientId", protect, changeStatusOfClient);

// Project routes
router.patch("/edit-project/:projectId", protect, editProject);
router.delete("/delete-project/:projectId",protect, deleteProject);

module.exports = router;
