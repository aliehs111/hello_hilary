// index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mediaRoutes = require("./routes/media");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow frontend (localhost:5173) to connect
app.use(express.json()); // Parse JSON bodies

// Routes
app.use("/api/media", mediaRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
