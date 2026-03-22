// server/routes/media.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const {
  createMediaConvertJob,
  watchMediaConvertJob,
} = require("../lib/mediaconvert");

const { S3Client, DeleteObjectsCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const { uploader, media_type, categories, q, hilary_page } = req.query;
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
        m.categories,
        m.is_hilary_page,
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

    if (hilary_page === "true") {
      query += ` AND m.is_hilary_page = true`;
    } else if (hilary_page === "false") {
      query += ` AND m.is_hilary_page = false`;
    }

    if (categories) {
      const categoryArray = categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      if (categoryArray.length > 0) {
        query += ` AND m.categories && $${idx++}::text[]`;
        values.push(categoryArray);
      }
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

router.post("/complete", requireAuth, async (req, res) => {
  try {
    const {
      media_type,
      original_key,
      mime_type,
      size_bytes,
      title,
      caption,
      categories,
      is_hilary_page,
      original_filename,
    } = req.body;

    // ... your existing validation ...

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
    categories,
    is_hilary_page,
    is_featured,
    is_hidden,
    original_filename,
    mime_type,
    size_bytes,
    error_message
  )
  VALUES ($1,$2,$3,$4,NULL,NULL,$5,$6,$7,$8,false,false,$9,$10,$11,NULL)
  RETURNING id
`;

    const values = [
      req.user.id,
      media_type,
      initialStatus,
      original_key,
      title ?? null,
      caption ?? null,
      categories ?? [],
      is_hilary_page ?? false,
      original_filename ?? null,
      mime_type,
      Number(size_bytes) || null,
    ];

    const result = await db.query(insert, values);
    const mediaId = result.rows[0].id;

    // ── NEW: Trigger MediaConvert for videos ──
    let processingMessage = "Upload complete";
    if (media_type === "video") {
      try {
        const { jobId, playbackKey, thumbnailKey } =
          await createMediaConvertJob({
            mediaId,
            originalKey: original_key,
          });

        // Start watcher in background (non-blocking)
        watchMediaConvertJob({
          mediaId,
          jobId,
          playbackKey,
          thumbnailKey,
          maxAttempts: 120, // ~20 min timeout
          delayMs: 10000,
        }).catch((err) => {
          console.error(`Background watcher failed for media ${mediaId}:`, err);
          // Optional: call markFailed via DB here if critical
        });

        processingMessage =
          "Video processing started (thumbnails & playback will appear soon)";
        console.log(`MediaConvert job ${jobId} started for media ${mediaId}`);
      } catch (jobErr) {
        console.error(`Failed to start MediaConvert for ${mediaId}:`, jobErr);
        // Optionally mark failed in DB
        await db.query(
          `UPDATE media SET status = 'failed', error_message = $1 WHERE id = $2`,
          [jobErr.message || "Failed to start processing", mediaId],
        );
        processingMessage = "Upload saved, but processing failed to start";
      }
    }

    res.json({
      media: result.rows[0],
      message: processingMessage,
    });
  } catch (err) {
    console.error("[POST /api/media/complete] error:", err);
    res.status(500).json({ error: "Failed to complete media upload" });
  }
});

// POST /api/media/:id/processed
router.post("/:id/processed", requireAuth, async (req, res) => {
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
router.post("/:id/failed", requireAuth, async (req, res) => {
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

// PATCH /api/media/:id
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const ownerCheck = await db.query("SELECT user_id FROM media WHERE id = $1", [id]);
    if (ownerCheck.rows.length === 0) return res.status(404).json({ error: "Media not found" });
    const isOwner = ownerCheck.rows[0].user_id === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });
    const {
      is_featured,
      is_hidden,
      is_hilary_page,
      title,
      caption,
      categories,
    } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (typeof is_featured === "boolean") {
      fields.push(`is_featured = $${idx++}`);
      values.push(is_featured);
    }

    if (typeof is_hidden === "boolean") {
      fields.push(`is_hidden = $${idx++}`);
      values.push(is_hidden);
    }

    if (typeof is_hilary_page === "boolean") {
      fields.push(`is_hilary_page = $${idx++}`);
      values.push(is_hilary_page);
    }

    if (typeof title === "string") {
      fields.push(`title = $${idx++}`);
      values.push(title.trim() || null);
    }

    if (typeof caption === "string") {
      fields.push(`caption = $${idx++}`);
      values.push(caption.trim() || null);
    }

    if (Array.isArray(categories)) {
      fields.push(`categories = $${idx++}::text[]`);
      values.push(categories);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    fields.push(`updated_at = now()`);
    values.push(id);

    const result = await db.query(
      `
      UPDATE media
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING *
      `,
      values,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Media not found" });
    }

    res.json({ media: result.rows[0] });
  } catch (err) {
    console.error("[PATCH /api/media/:id] error:", err);
    res.status(500).json({ error: "Failed to update media" });
  }
});

// DELETE /api/media/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch media to get S3 keys and check ownership
    const mediaRes = await db.query(
      `
      SELECT user_id, original_key, playback_key, thumbnail_key
      FROM media
      WHERE id = $1
      `,
      [id],
    );

    if (mediaRes.rows.length === 0) {
      return res.status(404).json({ error: "Media not found" });
    }

    const isOwner = mediaRes.rows[0].user_id === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });

    const media = mediaRes.rows[0];

    // Delete S3 files if they exist
    const keys = [
      media.original_key,
      media.playback_key,
      media.thumbnail_key,
    ].filter(Boolean);

    if (keys.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: process.env.S3_BUCKET,
          Delete: { Objects: keys.map((Key) => ({ Key })) },
        }),
      );
      console.log(`Deleted ${keys.length} S3 files for media ${id}`);
    }

    // Delete from DB
    await db.query("DELETE FROM media WHERE id = $1", [id]);

    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("[DELETE /api/media/:id] error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
