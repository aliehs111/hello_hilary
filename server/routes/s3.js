// server/routes/s3.js
"use strict";

const express = require("express");
const crypto = require("crypto");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const router = express.Router();

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function safeExt(ext) {
  if (!ext) return "";
  const cleaned = String(ext)
    .replace(/[^a-z0-9.]/gi, "")
    .toLowerCase();
  return cleaned.replace(/^\./, "");
}

function buildKey({ kind, id, ext }) {
  const folder =
    kind === "video" ? "video" : kind === "photo" ? "photo" : "media";
  const e = safeExt(ext);
  return `uploads/${folder}/${id}${e ? `.${e}` : ""}`;
}

// Create S3 client (will throw early if env is missing)
let s3;
try {
  const region = requireEnv("AWS_REGION");
  // Bucket is required for routes
  requireEnv("S3_BUCKET");

  s3 = new S3Client({
    region,
    credentials: {
      accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
    },
  });
} catch (e) {
  // Don't crash the whole app at require-time; just log.
  // The routes will return 500 with a helpful error if called.
  console.error("[s3 routes] config error:", e.message);
}

/**
 * POST /api/s3/presign-upload
 * body: { contentType: string, kind?: "video"|"photo", ext?: "mov"|"jpg"|... }
 * returns: { uploadUrl, key }
 */
router.post("/presign-upload", async (req, res) => {
  try {
    if (!s3) throw new Error("S3 client not configured (check env vars)");

    const { contentType, ext, kind } = req.body || {};

    if (!contentType) {
      return res.status(400).json({ error: "contentType required" });
    }

    const id = crypto.randomUUID();
    const key = buildKey({ kind, id, ext });

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    res.json({ uploadUrl, key });
  } catch (err) {
    console.error("[presign-upload] error:", err);
    res.status(500).json({ error: "Failed to presign upload" });
  }
});

/**
 * GET /api/s3/presign-download?key=uploads/...
 * returns: { url }
 */
router.get("/presign-download", async (req, res) => {
  try {
    if (!s3) throw new Error("S3 client not configured (check env vars)");

    const { key } = req.query || {};
    if (!key) {
      return res.status(400).json({ error: "key required" });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 10 }); // 10 min
    res.json({ url });
  } catch (err) {
    console.error("[presign-download] error:", err);
    res.status(500).json({ error: "Failed to presign download" });
  }
});

module.exports = router;
