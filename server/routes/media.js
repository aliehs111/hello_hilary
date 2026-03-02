const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/media
// Optional query params: uploader, type, q
router.get("/", async (req, res) => {
  try {
    const { uploader, type, q } = req.query;

    let query = `
      SELECT m.id,
             m.user_id,
             u.display_name,
             m.type,
             m.title,
             m.message,
             m.storage_key,
             m.content_type,
             m.bytes,
             m.created_at
      FROM media m
      JOIN users u ON m.user_id = u.id
      WHERE 1=1
    `;

    const values = [];
    let idx = 1;

    if (uploader) {
      query += ` AND m.user_id = $${idx++}`;
      values.push(uploader);
    }

    if (type) {
      query += ` AND m.type = $${idx++}`;
      values.push(type);
    }

    if (q) {
      query += ` AND (m.title ILIKE $${idx} OR m.message ILIKE $${idx})`;
      values.push(`%${q}%`);
      idx++;
    }

    query += ` ORDER BY m.created_at DESC`;

    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

module.exports = router;
