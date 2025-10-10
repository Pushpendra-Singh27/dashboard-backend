const Project = require('../models/Project');
const mongoose = require('mongoose');

/**
 * Edit project fields: name, assignedTo, description, expiryDate, renewalCost, status, serviceProvider
 * @route PUT /api/projects/:projectId
 * @access Private (assuming authentication middleware)
 */
const editProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, assignedTo, description, expiryDate, renewalCost, status, serviceProvider } = req.body;

    // Validate projectId
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    // Find the project
    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Prepare update object with only provided fields
    const updateFields = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Project name cannot be empty'
        });
      }
      updateFields.name = name.trim();
    }

    if (assignedTo !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assignedTo client ID'
        });
      }
      updateFields.assignedTo = assignedTo;
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Project description cannot be empty'
        });
      }
      updateFields.description = description.trim();
    }

    if (expiryDate !== undefined) {
      const expiry = new Date(expiryDate);
      if (isNaN(expiry.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid expiry date format'
        });
      }
      updateFields.expiryDate = expiry;
    }

    if (renewalCost !== undefined) {
      const cost = Number(renewalCost);
      if (isNaN(cost) || cost < 0) {
        return res.status(400).json({
          success: false,
          message: 'Renewal cost must be a valid non-negative number'
        });
      }
      updateFields.renewalCost = cost;
    }

    if (status !== undefined) {
      const validStatuses = ['active', 'expired', 'renewed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }
      updateFields.status = status;
    }

    if (serviceProvider !== undefined) {
      // Allow empty string or null to clear the field
      updateFields.serviceProvider = serviceProvider ? serviceProvider.trim() : null;
    }

    // Check if at least one field is provided for update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided for update'
      });
    }

    // Update the project
    const updatedProject = await Project.findOneAndUpdate(
      { projectId },
      { $set: updateFields },
      { 
        new: true, 
        runValidators: true,
        populate: {
          path: 'assignedTo',
          select: 'name email'
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });

  } catch (error) {
    console.error('Error updating project:', error);

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
      return res.status(400).json({
        success: false,
        message: 'Project with this ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  editProject
};