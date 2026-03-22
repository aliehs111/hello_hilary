'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth, tokenHash } = require('../middleware/auth');

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Brute force tracking (in-memory, fine at this scale)
const loginAttempts = new Map(); // ip -> { count }

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
}

async function sendBruteForceAlert(ip, count) {
  // TODO: wire up nodemailer when SMTP vars are configured
  console.error(`[BRUTE FORCE ALERT] ${count} failed login attempts from IP: ${ip}`);
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const ip = getClientIp(req);
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  email = String(email).trim().toLowerCase();

  // Brute force: exponential backoff after 5 failed attempts
  const attempts = loginAttempts.get(ip) || { count: 0 };
  if (attempts.count >= 5) {
    const delay = Math.min(Math.pow(2, attempts.count - 5) * 1000, 30000);
    await new Promise((r) => setTimeout(r, delay));
  }

  try {
    const result = await db.query(
      'SELECT id, email, display_name, role, is_enabled, password_hash FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    if (!user || !user.is_enabled) {
      const newCount = attempts.count + 1;
      loginAttempts.set(ip, { count: newCount });
      if (newCount >= 10) await sendBruteForceAlert(ip, newCount);
      await db.query(
        `INSERT INTO activity_logs (id, user_id, event_type, metadata, ip_address)
         VALUES ($1, $2, 'login_failed', $3, $4)`,
        [uuidv4(), user?.id || null, JSON.stringify({ email, reason: user ? 'account_disabled' : 'user_not_found' }), ip]
      );
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      const newCount = attempts.count + 1;
      loginAttempts.set(ip, { count: newCount });
      if (newCount >= 10) await sendBruteForceAlert(ip, newCount);
      await db.query(
        `INSERT INTO activity_logs (id, user_id, event_type, metadata, ip_address)
         VALUES ($1, $2, 'login_failed', $3, $4)`,
        [uuidv4(), user.id, JSON.stringify({ email, reason: 'wrong_password' }), ip]
      );
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Success — clear brute force counter
    loginAttempts.delete(ip);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const hash = tokenHash(token);
    await db.query(
      `INSERT INTO sessions (id, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, now() + interval '30 days')`,
      [uuidv4(), user.id, hash]
    );

    await db.query(
      `INSERT INTO activity_logs (id, user_id, event_type, metadata, ip_address)
       VALUES ($1, $2, 'login', $3, $4)`,
      [uuidv4(), user.id, JSON.stringify({ email }), ip]
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: THIRTY_DAYS_MS,
    });

    return res.json({
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      role: user.role,
    });
  } catch (err) {
    console.error('[login] error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req, res) => {
  const ip = getClientIp(req);
  const token = req.cookies?.auth_token;

  try {
    if (token) {
      await db.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash(token)]);
    }
    await db.query(
      `INSERT INTO activity_logs (id, user_id, event_type, metadata, ip_address)
       VALUES ($1, $2, 'logout', '{}', $3)`,
      [uuidv4(), req.user.id, ip]
    );
    res.clearCookie('auth_token');
    return res.json({ ok: true });
  } catch (err) {
    console.error('[logout] error:', err);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
