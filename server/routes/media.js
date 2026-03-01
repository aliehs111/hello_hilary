// routes/media.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/media - Fetch all media (photos + videos) for gallery
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, s3_key, media_type, mime_type, title, message, created_at FROM media ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

// GET /api/media/photos - Just photos
router.get("/photos", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM media WHERE media_type = 'photo' ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});

// GET /api/media/videos - Just videos
router.get("/videos", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM media WHERE media_type = 'video' ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// Placeholder for upload (we'll expand this next)
router.post("/upload", (req, res) => {
  res.status(501).json({ message: "Upload endpoint coming soon" });
});

module.exports = router;
