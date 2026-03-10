// server/routes/media.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/media
// Optional query params:
//   uploader=<uuid>
//   media_type=photo|video
//   category=<string>
//   status=uploaded|processing|ready|failed
//   q=<search string> (searches title + caption)
router.get("/", async (req, res) => {
  try {
    const { uploader, media_type, category, q } = req.query;
    const status = req.query.status;

    let query = `
      SELECT
        m.id,
        m.user_id,
        u.display_name,
        m.media_type,
        m.status,
        m.original_key,
        m.playback_key,
        m.thumbnail_key,
        m.title,
        m.caption,
        m.category,
        m.original_filename,
        m.mime_type,
        m.size_bytes,
        m.is_featured,
        m.is_hidden,
        m.error_message,
        m.created_at,
        m.updated_at
      FROM media m
      JOIN users u ON m.user_id = u.id
      WHERE m.is_hidden = false
    `;

    const values = [];
    let idx = 1;

    if (status) {
      query += ` AND m.status = $${idx++}`;
      values.push(status);
    } else {
      query += ` AND m.status IN ('uploaded','processing','ready')`;
    }

    if (uploader) {
      query += ` AND m.user_id = $${idx++}`;
      values.push(uploader);
    }

    if (media_type) {
      query += ` AND m.media_type = $${idx++}`;
      values.push(media_type);
    }

    if (category) {
      query += ` AND m.category = $${idx++}`;
      values.push(category);
    }

    if (q) {
      query += ` AND (COALESCE(m.title,'') ILIKE $${idx} OR COALESCE(m.caption,'') ILIKE $${idx})`;
      values.push(`%${q}%`);
      idx++;
    }

    query += ` ORDER BY m.created_at DESC LIMIT 200`;
    // query += ` ORDER BY m.created_at DESC LIMIT 1`;

    const result = await db.query(query, values);
    res.json({ media: result.rows });
  } catch (err) {
    console.error("[GET /api/media] error:", err);
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

// POST /api/media/complete
router.post("/complete", async (req, res) => {
  try {
    const {
      user_id,
      media_type,
      original_key,
      mime_type,
      size_bytes,
      title,
      caption,
      category,
      original_filename,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "user_id required" });
    }

    if (media_type !== "photo" && media_type !== "video") {
      return res
        .status(400)
        .json({ error: "media_type must be 'photo' or 'video'" });
    }

    if (!original_key) {
      return res.status(400).json({ error: "original_key required" });
    }

    if (!mime_type) {
      return res.status(400).json({ error: "mime_type required" });
    }

    const bytes = size_bytes == null ? null : Number(size_bytes);
    if (bytes != null && (!Number.isFinite(bytes) || bytes <= 0)) {
      return res
        .status(400)
        .json({ error: "size_bytes must be a positive number (or omit it)" });
    }

    const initialStatus = media_type === "photo" ? "ready" : "processing";

    const insert = `
      INSERT INTO media (
        user_id,
        media_type,
        status,
        original_key,
        playback_key,
        thumbnail_key,
        title,
        caption,
        category,
        is_featured,
        is_hidden,
        original_filename,
        mime_type,
        size_bytes,
        error_message
      )
      VALUES ($1,$2,$3,$4,NULL,NULL,$5,$6,$7,false,false,$8,$9,$10,NULL)
      RETURNING *
    `;

    const values = [
      user_id,
      media_type,
      initialStatus,
      original_key,
      title ?? null,
      caption ?? null,
      category ?? null,
      original_filename ?? null,
      mime_type,
      bytes,
    ];

    const result = await db.query(insert, values);
    res.json({ media: result.rows[0] });
  } catch (err) {
    console.error("[POST /api/media/complete] error:", err);
    res.status(500).json({ error: "Failed to complete media upload" });
  }
});

// POST /api/media/:id/processed
router.post("/:id/processed", async (req, res) => {
  try {
    const { id } = req.params;
    const { playback_key, thumbnail_key } = req.body;

    if (!playback_key) {
      return res.status(400).json({ error: "playback_key required" });
    }

    const result = await db.query(
      `
      UPDATE media
      SET
        playback_key = $1,
        thumbnail_key = $2,
        status = 'ready',
        error_message = NULL,
        updated_at = now()
      WHERE id = $3
      RETURNING *
      `,
      [playback_key, thumbnail_key ?? null, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Media not found" });
    }

    res.json({ media: result.rows[0] });
  } catch (err) {
    console.error("[POST /api/media/:id/processed] error:", err);
    res.status(500).json({ error: "Failed to mark media processed" });
  }
});

// POST /api/media/:id/failed
router.post("/:id/failed", async (req, res) => {
  try {
    const { id } = req.params;
    const { error_message } = req.body;

    const result = await db.query(
      `
      UPDATE media
      SET
        status = 'failed',
        error_message = $1,
        updated_at = now()
      WHERE id = $2
      RETURNING *
      `,
      [error_message ?? "Processing failed", id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Media not found" });
    }

    res.json({ media: result.rows[0] });
  } catch (err) {
    console.error("[POST /api/media/:id/failed] error:", err);
    res.status(500).json({ error: "Failed to mark media failed" });
  }
});

module.exports = router;
