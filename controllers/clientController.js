// controllers/clientController.js
const Client = require("../models/Client");
const Project = require("../models/Project");

// Get all projects of a client
const getClientProjects = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // First, update expired projects to expired status
    const currentDate = new Date();
    await Project.updateMany(
      { 
        expiryDate: { $lt: currentDate },
        status: { $ne: "expired" }
      },
      { $set: { status: "expired" } }
    );
    
    const client = await Client.findOne({ clientId }).populate("projects");
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({
      message: "Client projects fetched successfully",
      projects: client.projects,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get client profile
const getClientProfile = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // First, update expired projects to expired status
    const currentDate = new Date();
    await Project.updateMany(
      { 
        expiryDate: { $lt: currentDate },
        status: { $ne: "expired" }
      },
      { $set: { status: "expired" } }
    );
    
    const client = await Client.findOne({ clientId }).select("-password").populate("projects");
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({
      message: "Client profile fetched successfully",
      client,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get single project details for a client
const getClientProjectDetails = async (req, res) => {
  try {
    const { clientId, projectId } = req.params;

    // First, update expired projects to expired status
    const currentDate = new Date();
    await Project.updateMany(
      { 
        expiryDate: { $lt: currentDate },
        status: { $ne: "expired" }
      },
      { $set: { status: "expired" } }
    );

    const client = await Client.findOne({ clientId });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const project = await Project.findOne({ projectId, assignedTo: client._id });
    if (!project) {
      return res.status(404).json({ message: "Project not found for this client" });
    }

    res.status(200).json({
      message: "Project details fetched successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getClientProjects,
  getClientProfile,
  getClientProjectDetails,
};
