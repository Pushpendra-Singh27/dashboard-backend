const express = require("express");
const Admin = require('./models/Admin');
const Client = require('./models/Client');
const Project = require('./models/Project');
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import routes
const clientRoutes = require('./routes/clientRoutes');
const adminRoutes = require('./routes/adminRoutes');

const port = process.env.PORT || 3000;
console.log(process.env.PORT);

app.use(express.json());
app.use(cors({
  credentials: true // Allow cookies to be sent
}));

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'Dashboard Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);
mongoose
  .connect(process.env.MONGOURL)
  .then(async () => {
    console.log("✅ Connected to database successfully");
    
    // Create default admin if it doesn't exist
    await Admin.createDefaultAdmin();
    
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📊 API available at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("❌ Database connection error:", error);
  });