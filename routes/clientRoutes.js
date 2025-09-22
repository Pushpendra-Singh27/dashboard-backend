const express = require('express');
const router = express.Router();
const {
  clientLogin,
  clientLogout,
  getClientProjects,
  getClientProfile,
  getClientProjectDetails
} = require('../controllers/clientController');

// Authentication Routes

// @route   POST /api/client/login
// @desc    Client login using client ID or email with password
// @access  Public
router.post('/login', clientLogin);

// @route   POST /api/client/logout
// @desc    Client logout
// @access  Private (Client)
router.post('/logout', clientLogout);

// Client Data Routes

// @route   GET /api/client/:clientId/projects
// @desc    Get all projects assigned to a specific client
// @access  Private (Client)
router.get('/:clientId/projects', getClientProjects);

// @route   GET /api/client/:clientId/profile
// @desc    Get client profile with project summary
// @access  Private (Client)
router.get('/:clientId/profile', getClientProfile);

// @route   GET /api/client/:clientId/projects/:projectId
// @desc    Get specific project details for a client
// @access  Private (Client)
router.get('/:clientId/projects/:projectId', getClientProjectDetails);

module.exports = router;
