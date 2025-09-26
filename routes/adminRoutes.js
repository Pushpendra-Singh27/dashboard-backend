const express = require('express');
const router = express.Router();
const {
  adminLogin,
  adminLogout,
  getAdminProfile,
  addNewClient,
  addNewProjectToClient,
  getAllClients,
  getAllProjects
} = require('../controllers/adminController');

// Authentication Routes

// @route   POST /api/admin/login
// @desc    Admin login authentication
// @access  Public
router.post('/login', adminLogin);

// @route   POST /api/admin/logout
// @desc    Admin logout
// @access  Private (Admin)
router.post('/logout', adminLogout);

// @route   GET /api/admin/profile
// @desc    Get admin profile information
// @access  Private (Admin)
router.get('/profile', getAdminProfile);

// Client Management Routes

// @route   POST /api/admin/clients
// @desc    Add and save a new client to the database
// @access  Private (Admin)
router.post('/clients', addNewClient);

// @route   GET /api/admin/clients
// @desc    Get all clients with project statistics
// @access  Private (Admin)
router.get('/clients', getAllClients);

// @route   PUT /api/admin/clients/:clientId/generate-id
// @desc    Generate a unique client ID and save it to the database
// @access  Private (Admin)
// router.put('/clients/:clientId/generate-id', generateUniqueClientId);

// Project Management Routes

// @route   POST /api/admin/clients/:clientId/projects
// @desc    Add new project to client ID and save it to database using project ID as primary key
// @access  Private (Admin)
router.post('/clients/:clientId/projects', addNewProjectToClient);

// @route   GET /api/admin/projects
// @desc    Get all projects with client information
// @access  Private (Admin)
router.get('/projects', getAllProjects);

module.exports = router;
