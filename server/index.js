"use strict";

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./routes/auth");
const mediaRoutes = require("./routes/media");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5001;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Health check (no DB dependency so it always answers)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes BEFORE SPA catch-all
app.use("/api/auth", authRoutes);
app.use("/api/media", mediaRoutes);

// Serve Vite build
const distPath = path.join(__dirname, "..", "client", "dist");
app.use(express.static(distPath, { index: false }));

// SPA catch-all
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      console.error("[static] index.html missing. Did client build run?", err);
      res.status(500).send("Frontend build missing.");
    }
  });
});

// IMPORTANT for Railway/container routing
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on ${PORT}`);
});
