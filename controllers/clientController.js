const Client = require('../models/Client');
const Project = require('../models/Project');
const jwt = require('jsonwebtoken');

/**
 * Client login authentication
 * @desc    Authenticate client using client ID or email with password
 * @route   POST /api/client/login
 * @access  Public
 */
const clientLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Validate required fields
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Client ID/Email and password are required'
      });
    }

    let client;

    // Check if identifier is an email (contains @) or client ID
    if (identifier.includes('@')) {
      // Login with email
      client = await Client.findByEmail(identifier).select('+password');
    } else {
      // Login with client ID
      client = await Client.findByClientId(identifier).select('+password');
    }

    if (!client) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if client account is active
    if (!client.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Client account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await client.matchPassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    client.lastLogin = new Date();
    await client.save();

    // Get project count for client info
    const projectCount = await Project.countDocuments({ assignedTo: client._id });

    // Generate JWT token
    const token = jwt.sign(
      { 
        clientId: client._id,
        clientUserId: client.clientId,
        email: client.email,
        role: 'client'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Client login successful',
      data: {
        client: {
          clientId: client.clientId,
          name: client.name,
          email: client.email,
          lastLogin: client.lastLogin,
          isActive: client.isActive,
          projectCount: projectCount
        },
        token,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Error during client login:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Client logout
 * @desc    Logout client and invalidate session
 * @route   POST /api/client/logout
 * @access  Private (Client)
 */
const clientLogout = async (req, res) => {
  try {
    // In a simple JWT implementation, logout is handled client-side by removing the token
    // For more security, you could implement token blacklisting here
    
    res.status(200).json({
      success: true,
      message: 'Client logout successful'
    });

  } catch (error) {
    console.error('Error during client logout:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get client's project details
 * @desc    Get all projects assigned to a specific client with populated project names
 * @route   GET /api/client/:clientId/projects
 * @access  Private (Client)
 */
const getClientProjects = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Find client by clientId
    const client = await Client.findByClientId(clientId);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Find all projects assigned to this client and populate project details
    const projects = await Project.find({ assignedTo: client._id })
      .populate('assignedTo', 'name email clientId')
      .sort({ createdAt: -1 }); // Sort by newest first

    // Format the response with additional project information
    const formattedProjects = projects.map(project => ({
      projectId: project.projectId,
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      expiryDate: project.expiryDate,
      renewalCost: project.renewalCost,
      daysUntilExpiry: project.getDaysUntilExpiry(),
      isExpired: project.isExpired(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      renewalHistory: project.renewalHistory
    }));

    res.status(200).json({
      success: true,
      message: 'Projects retrieved successfully',
      data: {
        client: {
          clientId: client.clientId,
          name: client.name,
          email: client.email,
          projectCount: formattedProjects.length
        },
        projects: formattedProjects
      }
    });

  } catch (error) {
    console.error('Error fetching client projects:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get client profile with basic project summary
 * @desc    Get client profile with project count and summary
 * @route   GET /api/client/:clientId/profile
 * @access  Private (Client)
 */
const getClientProfile = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Find client and populate projects
    const client = await Client.findByClientId(clientId)
      .populate('projects', 'name status expiryDate');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Get project statistics
    const projects = await Project.find({ assignedTo: client._id });
    
    const projectStats = {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      expired: projects.filter(p => p.status === 'expired').length,
      renewed: projects.filter(p => p.status === 'renewed').length,
      cancelled: projects.filter(p => p.status === 'cancelled').length
    };

    // Get expiring projects (within 30 days)
    const expiringProjects = projects.filter(p => {
      const daysUntilExpiry = p.getDaysUntilExpiry();
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0 && p.status === 'active';
    });

    res.status(200).json({
      success: true,
      message: 'Client profile retrieved successfully',
      data: {
        client: client.getPublicProfile(),
        projectStats,
        expiringProjectsCount: expiringProjects.length,
        expiringProjects: expiringProjects.map(p => ({
          projectId: p.projectId,
          name: p.name,
          expiryDate: p.expiryDate,
          daysUntilExpiry: p.getDaysUntilExpiry()
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching client profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get specific project details for a client
 * @desc    Get detailed information about a specific project assigned to a client
 * @route   GET /api/client/:clientId/projects/:projectId
 * @access  Private (Client)
 */
const getClientProjectDetails = async (req, res) => {
  try {
    const { clientId, projectId } = req.params;

    // Find client by clientId
    const client = await Client.findByClientId(clientId);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Find the specific project assigned to this client
    const project = await Project.findOne({ 
      projectId: projectId.toUpperCase(),
      assignedTo: client._id 
    }).populate('assignedTo', 'name email clientId');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or not assigned to this client'
      });
    }

    // Format the response with complete project information
    const projectDetails = {
      projectId: project.projectId,
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      expiryDate: project.expiryDate,
      renewalCost: project.renewalCost,
      daysUntilExpiry: project.getDaysUntilExpiry(),
      durationInDays: project.durationInDays,
      isExpired: project.isExpired(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      renewalHistory: project.renewalHistory,
      assignedTo: {
        clientId: project.assignedTo.clientId,
        name: project.assignedTo.name,
        email: project.assignedTo.email
      }
    };

    res.status(200).json({
      success: true,
      message: 'Project details retrieved successfully',
      data: {
        project: projectDetails
      }
    });

  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  clientLogin,
  clientLogout,
  getClientProjects,
  getClientProfile,
  getClientProjectDetails
};
