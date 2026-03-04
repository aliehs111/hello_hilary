const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/login", async (req, res) => {
  let { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Email and code required" });
  }

  email = String(email).trim().toLowerCase();

  if (code !== process.env.UPLOAD_CODE) {
    return res.status(401).json({ error: "Invalid code" });
  }

  try {
    const result = await db.query(
      "SELECT id, email, display_name, role FROM users WHERE email = $1 AND is_enabled = true",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Not invited" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("[login] error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
