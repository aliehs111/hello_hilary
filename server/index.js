// index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./routes/auth");
const mediaRoutes = require("./routes/media");
const db = require("./db");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Seed admin user ONLY when enabled (set SEED_ADMIN=true in env)
async function seedAdmin() {
  if (process.env.SEED_ADMIN !== "true") return;

  try {
    await db.query(
      `INSERT INTO users (email, display_name, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING`,
      ["sheila@hello-hilary.com", "Sheila", "admin"],
    );
    console.log("Admin user seeded");
  } catch (err) {
    console.error("Error seeding admin user:", err);
  }
}
seedAdmin();

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/media", mediaRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Serve frontend build if present (Vite build output)
const distPath = path.join(__dirname, "../client/dist");
app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
