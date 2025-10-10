const express = require('express');
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

app.use(cors({
  origin: ['https://renew-my-service.vercel.app', 'http://localhost:3000', 'http://localhost:8080', 'https://renew-my-service-k3yhwwxv8-pushpendras-projects-9183daec.vercel.app', 'https://dashboard-backend-2msz.onrender.com'], // Your frontend URLs
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200 // For legacy browser support
}));
app.use(express.json());
app.use(cookieParser());

// Routes
const adminRoutes = require("./routes/adminRoutes");
const clientRoutes = require("./routes/clientRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const projectRoutes = require("./routes/projectRoutes");

app.use("/admin", adminRoutes);
app.use("/client", clientRoutes);
app.use("/payment", paymentRoutes);
app.use("/project", projectRoutes);

const port = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGOURL)
  .then(() => {
    console.log("✅ Connected to database successfully");
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📊 Admin API at /api/admin`);
      console.log(`📊 Client API at /api/client`);
      console.log(`💳 Payment API at /api/payment`);
      console.log(`📋 Project API at /api/project`);
    });
  })
  .catch((error) => {
    console.error("❌ Database connection error:", error);
  });
