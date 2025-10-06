// controllers/adminController.js
const Admin = require("../models/admin.js");
const Client = require("../models/client.js");
const Project = require("../models/project.js");
const bcrypt = require("bcryptjs");

// Create new admin
const createNewAdmin = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ userId });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this userId already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const newAdmin = new Admin({
      userId,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "New admin created successfully",
      admin: {
        id: newAdmin._id,
        userId: newAdmin.userId,
        createdAt: newAdmin.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


const createNewClient = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ message: "Client with this email already exists" });
    }

    // Generate next clientId
    const lastClient = await Client.findOne().sort({ createdAt: -1 });
    let nextNumber = 1;

    if (lastClient) {
      const lastIdNum = parseInt(lastClient.clientId.slice(1)); // Remove 'C' prefix
      nextNumber = lastIdNum + 1;
    }

    const clientId = "C" + String(nextNumber).padStart(6, "0"); // e.g., C000001

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create client
    const newClient = new Client({
      name,
      email,
      password: hashedPassword,
      clientId,
    });

    await newClient.save();

    res.status(201).json({
      message: "New client created successfully",
      client: {
        id: newClient._id,
        clientId: newClient.clientId,
        name: newClient.name,
        email: newClient.email,
        createdAt: newClient.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const createNewProject = async (req, res) => {
  try {
    const { clientId, name, description, expiryDate, renewalCost } = req.body;

    // Check if client exists
    const client = await Client.findOne({ clientId });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Generate projectId
    const lastProject = await Project.findOne().sort({ createdAt: -1 });
    let nextNumber = 1;
    if (lastProject) {
      const lastIdNum = parseInt(lastProject.projectId.slice(1)); // Remove 'P' prefix
      nextNumber = lastIdNum + 1;
    }
    const projectId = "P" + String(nextNumber).padStart(6, "0"); // e.g., P000001

    // Create new project
    const newProject = new Project({
      projectId,
      name,
      description,
      expiryDate,
      renewalCost,
      assignedTo: client._id,
    });

    await newProject.save();

    // Link project to client
    client.projects.push(newProject._id);
    await client.save();

    res.status(201).json({
      message: "New project created successfully",
      project: {
        id: newProject._id,
        projectId: newProject.projectId,
        name: newProject.name,
        description: newProject.description,
        expiryDate: newProject.expiryDate,
        renewalCost: newProject.renewalCost,
        status: newProject.status,
        assignedTo: client.clientId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all clients
const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().select("-password").populate("projects");
    res.status(200).json({
      message: "All clients fetched successfully",
      clients,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("assignedTo", "clientId name email");
    res.status(200).json({
      message: "All projects fetched successfully",
      projects,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
     createNewAdmin,
     createNewClient,
     createNewProject,
     getAllClients,
     getAllProjects
};
