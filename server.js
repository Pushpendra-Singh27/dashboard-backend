const express = require('express');
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'], // Your frontend URLs
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

app.use("/api/admin", adminRoutes);
app.use("/api/client", clientRoutes);

const port = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGOURL)
  .then(() => {
    console.log("✅ Connected to database successfully");
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📊 Admin API at /api/admin`);
      console.log(`📊 Client API at /api/client`);
    });
  })
  .catch((error) => {
    console.error("❌ Database connection error:", error);
  });
