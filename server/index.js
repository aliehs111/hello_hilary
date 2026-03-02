// server/index.js
"use strict";

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./routes/auth");
const mediaRoutes = require("./routes/media");
const db = require("./db");

dotenv.config();

const app = express();

// Railway (and most hosts) inject PORT. Local dev falls back to 5001.
const PORT = Number(process.env.PORT) || 5001;
// Bind to all interfaces for container hosts (Railway/Docker/etc.)
const HOST = process.env.HOST || "0.0.0.0";

// ---- middleware ----
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// ---- health & diagnostics ----
app.get("/health", async (req, res) => {
  try {
    // Optional: verify DB connectivity without leaking details
    await db.query("SELECT 1");
    res.json({ status: "ok", db: "ok" });
  } catch (err) {
    res.status(200).json({ status: "ok", db: "error" });
  }
});

// ---- one-time/controlled admin seed ----
// Only runs when SEED_ADMIN=true (set it once in Railway, deploy, then remove it)
async function seedAdmin() {
  if (process.env.SEED_ADMIN !== "true") return;

  const email = process.env.ADMIN_EMAIL || "sheila@hello-hilary.com";
  const displayName = process.env.ADMIN_DISPLAY_NAME || "Sheila";
  const role = process.env.ADMIN_ROLE || "admin";

  try {
    await db.query(
      `INSERT INTO users (email, display_name, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING`,
      [email, displayName, role],
    );
    console.log(`[seedAdmin] ensured admin user exists: ${email}`);
  } catch (err) {
    console.error("[seedAdmin] error seeding admin user:", err);
  }
}

// Run seed in background at startup (doesn't block server from starting)
seedAdmin();

// ---- API routes (define BEFORE SPA catch-all) ----
app.use("/api/auth", authRoutes);
app.use("/api/media", mediaRoutes);

// ---- Serve React build (Vite) ----
const distPath = path.join(__dirname, "..", "client", "dist");
app.use(express.static(distPath, { index: false }));

// SPA catch-all (must be AFTER /api routes)
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      // If dist is missing in the container, this gives you a useful signal in logs
      console.error(
        "[static] Failed to send index.html. Is client/dist present?",
        err,
      );
      res.status(500).send("Frontend build missing or unreadable.");
    }
  });
});

// ---- start server ----
app.listen(PORT, HOST, () => {
  // Don't print localhost in production; it's misleading in containers.
  console.log(`Server listening on ${HOST}:${PORT}`);
  console.log(`NODE_ENV=${process.env.NODE_ENV || "unset"}`);
});
