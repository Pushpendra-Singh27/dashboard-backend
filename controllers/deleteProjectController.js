const Project = require('../models/Project');
const Client = require('../models/Client');

/**
 * Delete a project from the database
 * @route DELETE /api/projects/:projectId
 * @access Private (assuming authentication middleware)
 */
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Validate projectId
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    // Find the project first to get its details
    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Store project details for response
    const deletedProjectInfo = {
      projectId: project.projectId,
      name: project.name,
      assignedTo: project.assignedTo
    };

    // Remove project reference from the assigned client
    if (project.assignedTo) {
      await Client.findByIdAndUpdate(
        project.assignedTo,
        { $pull: { projects: project._id } },
        { new: true }
      );
    }

    // Delete the project
    await Project.findOneAndDelete({ projectId });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      data: {
        deletedProject: deletedProjectInfo
      }
    });

  } catch (error) {
    console.error('Error deleting project:', error);

    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
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
 * Delete multiple projects (bulk delete)
 * @route DELETE /api/projects/bulk
 * @access Private (assuming authentication middleware)
 */
const deleteMultipleProjects = async (req, res) => {
  try {
    const { projectIds } = req.body;

    // Validate input
    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Project IDs array is required and cannot be empty'
      });
    }

    // Find all projects to be deleted
    const projectsToDelete = await Project.find({ 
      projectId: { $in: projectIds } 
    }).select('projectId name assignedTo _id');

    if (projectsToDelete.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No projects found with the provided IDs'
      });
    }

    // Get unique client IDs and project object IDs
    const clientIds = [...new Set(projectsToDelete.map(p => p.assignedTo).filter(Boolean))];
    const projectObjectIds = projectsToDelete.map(p => p._id);

    // Remove project references from clients
    if (clientIds.length > 0) {
      await Client.updateMany(
        { _id: { $in: clientIds } },
        { $pull: { projects: { $in: projectObjectIds } } }
      );
    }

    // Delete all projects
    const deleteResult = await Project.deleteMany({ 
      projectId: { $in: projectIds } 
    });

    // Prepare response data
    const deletedProjects = projectsToDelete.map(p => ({
      projectId: p.projectId,
      name: p.name
    }));

    const notFoundProjects = projectIds.filter(
      id => !projectsToDelete.some(p => p.projectId === id)
    );

    res.status(200).json({
      success: true,
      message: `${deleteResult.deletedCount} project(s) deleted successfully`,
      data: {
        deletedProjects,
        deletedCount: deleteResult.deletedCount,
        notFoundProjects: notFoundProjects.length > 0 ? notFoundProjects : undefined
      }
    });

  } catch (error) {
    console.error('Error deleting multiple projects:', error);

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  deleteProject,
  deleteMultipleProjects
};