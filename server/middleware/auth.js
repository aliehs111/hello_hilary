'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');

function tokenHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function requireAuth(req, res, next) {
  const token = req.cookies?.auth_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  try {
    const hash = tokenHash(token);
    const sessionResult = await db.query(
      'SELECT id FROM sessions WHERE token_hash = $1 AND expires_at > now()',
      [hash]
    );
    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: 'Session expired or invalidated' });
    }

    const userResult = await db.query(
      'SELECT id, email, display_name, role FROM users WHERE id = $1 AND is_enabled = true',
      [payload.id]
    );
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found or disabled' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (err) {
    console.error('[requireAuth] error:', err);
    res.status(500).json({ error: 'Auth check failed' });
  }
}

async function requireAdmin(req, res, next) {
  await requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

module.exports = { requireAuth, requireAdmin, tokenHash };
