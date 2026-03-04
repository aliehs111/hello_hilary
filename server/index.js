"use strict";

const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

// Load env FIRST (important if any required modules read process.env on import)
dotenv.config();

const db = require("./db");

// Routes (loaded after dotenv so they can safely read env vars)
const s3Routes = require("./routes/s3");
const authRoutes = require("./routes/auth");
const mediaRoutes = require("./routes/media");

const app = express();
const PORT = Number(process.env.PORT) || 5001;

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
    credentials: true,
  }),
);

// Body parsing
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lightweight health check (NO DB) — good for container/platform probes
app.get("/ready", (req, res) => {
  res.json({ status: "ok" });
});

// DB health check (verifies DB connectivity)
app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok", db: "ok" });
  } catch (e) {
    console.error("[health db] error:", e);
    res.status(500).json({ status: "error", db: "error" });
  }
});

// API routes BEFORE SPA catch-all
app.use("/api/s3", s3Routes);
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
