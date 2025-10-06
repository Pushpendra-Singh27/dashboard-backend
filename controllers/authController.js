// controllers/adminController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin.js");
const Client = require("../models/client.js");
require("dotenv").config();

const Adminlogin = async (req, res) => {
  try {
    const { userId, password } = req.body; // Admin logs in with userId

    // Find admin by userId
    const admin = await Admin.findOne({ userId });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Token expiry (1 day)
    const expiresIn = "1d";

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, userId: admin.userId, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Save last login
    admin.lastLogin = new Date();
    await admin.save();

    // Set HTTP-only cookie (1 day)
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
    });

    // Send response
    res.status(200).json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        userId: admin.userId,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


const clientLogin = async (req, res) => {
  try {
    const { clientId, password } = req.body; // Login via clientId only

    // Find client by clientId
    const client = await Client.findOne({ clientId: clientId});
    if (!client) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Token expiry (1 day)
    const expiresIn = "1d";

    // Generate JWT token
    const token = jwt.sign(
      { id: client._id, clientId: client.clientId, role: "client" },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Save last login
    client.lastLogin = new Date();
    await client.save();

    // Set HTTP-only cookie (1 day)
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
    });

    // Send response
    res.status(200).json({
      message: "Client login successful",
      token,
      client: {
        id: client._id,
        clientId: client.clientId,
        name: client.name,
        email: client.email,
        isActive: client.isActive,
        lastLogin: client.lastLogin,
        projects: client.projects,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    // Clear the JWT cookie
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
      message: "Logout successful"
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
    Adminlogin,
    clientLogin,
    logout
 };
