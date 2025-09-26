const Client = require('../models/Client');
const Project = require('../models/Project');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

/**
 * Admin login authentication
 * @desc    Authenticate admin with username and password
 * @route   POST /api/admin/login
 * @access  Public
 */
const adminLogin = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Validate required fields
    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find admin by userId and include password field
    const admin = await Admin.findByUserId(userId).select('+password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if admin account is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await admin.matchPassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token (you can set JWT_SECRET in your .env file)
    const token = jwt.sign(
      { 
        adminId: admin._id,
        userId: admin.userId,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: {
          userId: admin.userId,
          lastLogin: admin.lastLogin,
          isActive: admin.isActive
        },
        token,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Admin logout (optional - mainly for token blacklisting if needed)
 * @desc    Logout admin and invalidate session
 * @route   POST /api/admin/logout
 * @access  Private (Admin)
 */
const adminLogout = async (req, res) => {
  try {
    // In a simple JWT implementation, logout is handled client-side by removing the token
    // For more security, you could implement token blacklisting here
    
    res.status(200).json({
      success: true,
      message: 'Admin logout successful'
    });

  } catch (error) {
    console.error('Error during admin logout:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get admin profile information
 * @desc    Get current admin profile details
 * @route   GET /api/admin/profile
 * @access  Private (Admin)
 */
const getAdminProfile = async (req, res) => {
  try {
    // Assuming you'll add middleware to extract admin info from JWT token
    // For now, we'll get the default admin
    const admin = await Admin.findByUserId('admin');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin profile retrieved successfully',
      data: {
        admin: {
          userId: admin.userId,
          lastLogin: admin.lastLogin,
          isActive: admin.isActive,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Add and save a new client to the database
 * @desc    Create a new client with all required information
 * @route   POST /api/admin/clients
 * @access  Private (Admin)
 */
const addNewClient = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields'
      });
    }

    // Check if client with email already exists
    const existingClient = await Client.findByEmail(email);
    if (existingClient) {
      return res.status(409).json({
        success: false,
        message: 'Client with this email already exists'
      });
    }

    // --- Generate unique clientId ---
    const clientCount = await Client.countDocuments();
    let newClientId;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      newClientId = `CLI${String(clientCount + attempts + 1).padStart(4, '0')}${randomSuffix}`;
      
      const existingClientId = await Client.findByClientId(newClientId);
      if (!existingClientId) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message: 'Unable to generate unique client ID after multiple attempts'
      });
    }

    // Create new client with generated clientId
    const newClient = new Client({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      clientId: newClientId
    });

    // Save client to database
    const savedClient = await newClient.save();

    // Return success response without password
    const clientResponse = savedClient.getPublicProfile();

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: {
        client: clientResponse
      }
    });

  } catch (error) {
    console.error('Error creating new client:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Client with this email or client ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


/**
 * Generate a unique client ID and save it to the database
 * @desc    Generate and assign a new unique client ID to an existing client
 * @route   PUT /api/admin/clients/:clientId/generate-id
 * @access  Private (Admin)
 */
// const generateUniqueClientId = async (req, res) => {
//   try {
//     const { clientId } = req.params;

//     // Find the client by current clientId
//     const client = await Client.findByClientId(clientId);
//     if (!client) {
//       return res.status(404).json({
//         success: false,
//         message: 'Client not found'
//       });
//     }

//     // Generate new unique client ID
//     const clientCount = await Client.countDocuments();
//     let newClientId;
//     let isUnique = false;
//     let attempts = 0;
//     const maxAttempts = 10;

//     // Generate unique client ID with retry logic
//     while (!isUnique && attempts < maxAttempts) {
//       const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
//       newClientId = `CLI${String(clientCount + attempts + 1).padStart(4, '0')}${randomSuffix}`;
      
//       // Check if this ID already exists
//       const existingClient = await Client.findByClientId(newClientId);
//       if (!existingClient) {
//         isUnique = true;
//       }
//       attempts++;
//     }

//     if (!isUnique) {
//       return res.status(500).json({
//         success: false,
//         message: 'Unable to generate unique client ID after multiple attempts'
//       });
//     }

//     // Update client with new ID
//     const oldClientId = client.clientId;
//     client.clientId = newClientId;
//     const updatedClient = await client.save();

//     res.status(200).json({
//       success: true,
//       message: 'Client ID generated and updated successfully',
//       data: {
//         client: updatedClient.getPublicProfile(),
//         oldClientId: oldClientId,
//         newClientId: newClientId
//       }
//     });

//   } catch (error) {
//     console.error('Error generating unique client ID:', error);
    
//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       return res.status(409).json({
//         success: false,
//         message: 'Generated client ID conflicts with existing ID'
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

/**
 * Add new project to client ID and save it to database using project ID as primary key
 * @desc    Create a new project and assign it to a specific client
 * @route   POST /api/admin/clients/:clientId/projects
 * @access  Private (Admin)
 */
const addNewProjectToClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { name, description, expiryDate, renewalCost, projectId } = req.body;

    // Validate required fields
    if (!name || !description || !expiryDate || !renewalCost) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, expiry date, and renewal cost are required fields'
      });
    }

    // Find the client by clientId
    const client = await Client.findByClientId(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Validate expiry date
    const expiryDateObj = new Date(expiryDate);
    if (expiryDateObj <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be in the future'
      });
    }

    // Validate renewal cost
    if (renewalCost < 0) {
      return res.status(400).json({
        success: false,
        message: 'Renewal cost cannot be negative'
      });
    }

    // Check if custom project ID is provided and if it already exists
    if (projectId) {
      const existingProject = await Project.findOne({ projectId: projectId.toUpperCase() });
      if (existingProject) {
        return res.status(409).json({
          success: false,
          message: 'Project with this project ID already exists'
        });
      }
    }

    // Create new project
    const newProject = new Project({
      name: name.trim(),
      assignedTo: client._id,
      description: description.trim(),
      expiryDate: expiryDateObj,
      renewalCost: parseFloat(renewalCost),
      projectId: projectId ? projectId.toUpperCase() : undefined // Let middleware generate if not provided
    });

    // Save project to database
    const savedProject = await newProject.save();

    // Add project reference to client's projects array
    client.projects.push(savedProject._id);
    await client.save();

    // Populate the assignedTo field for response
    await savedProject.populate('assignedTo', 'name email clientId');

    // Format response with additional project information
    const projectResponse = {
      projectId: savedProject.projectId,
      name: savedProject.name,
      description: savedProject.description,
      status: savedProject.status,
      startDate: savedProject.startDate,
      expiryDate: savedProject.expiryDate,
      renewalCost: savedProject.renewalCost,
      daysUntilExpiry: savedProject.getDaysUntilExpiry(),
      durationInDays: savedProject.durationInDays,
      isExpired: savedProject.isExpired(),
      createdAt: savedProject.createdAt,
      assignedTo: {
        clientId: savedProject.assignedTo.clientId,
        name: savedProject.assignedTo.name,
        email: savedProject.assignedTo.email
      }
    };

    res.status(201).json({
      success: true,
      message: 'Project created and assigned to client successfully',
      data: {
        project: projectResponse,
        clientInfo: {
          clientId: client.clientId,
          name: client.name,
          totalProjects: client.projects.length
        }
      }
    });

  } catch (error) {
    console.error('Error creating new project:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Project with this project ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all clients (Admin utility function)
 * @desc    Get all clients with their project counts
 * @route   GET /api/admin/clients
 * @access  Private (Admin)
 */
const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find({})
      .populate('projects', 'name status expiryDate')
      .sort({ createdAt: -1 });

    const clientsWithStats = clients.map(client => {
      const clientObj = client.getPublicProfile();
      return {
        ...clientObj,
        projectStats: {
          total: client.projects.length,
          active: client.projects.filter(p => p.status === 'active').length,
          expired: client.projects.filter(p => p.status === 'expired').length,
          renewed: client.projects.filter(p => p.status === 'renewed').length,
          cancelled: client.projects.filter(p => p.status === 'cancelled').length
        }
      };
    });

    res.status(200).json({
      success: true,
      message: 'Clients retrieved successfully',
      data: {
        clients: clientsWithStats,
        totalClients: clientsWithStats.length
      }
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all projects (Admin utility function)
 * @desc    Get all projects with client information
 * @route   GET /api/admin/projects
 * @access  Private (Admin)
 */
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate('assignedTo', 'name email clientId')
      .sort({ createdAt: -1 });

    const projectsWithDetails = projects.map(project => ({
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
      assignedTo: {
        clientId: project.assignedTo.clientId,
        name: project.assignedTo.name,
        email: project.assignedTo.email
      }
    }));

    res.status(200).json({
      success: true,
      message: 'Projects retrieved successfully',
      data: {
        projects: projectsWithDetails,
        totalProjects: projectsWithDetails.length
      }
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  adminLogin,
  adminLogout,
  getAdminProfile,
  addNewClient,
  addNewProjectToClient,
  getAllClients,
  getAllProjects
};
