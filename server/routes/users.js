'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// GET /api/users — list all users
router.get('/', requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, email, display_name, role, is_enabled, created_at
       FROM users ORDER BY created_at ASC`
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error('[GET /api/users] error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/users — create new user
router.post('/', requireAdmin, async (req, res) => {
  const { email, display_name, password, role } = req.body;

  if (!email || !display_name || !password || !role) {
    return res.status(400).json({ error: 'email, display_name, password, and role are required' });
  }
  if (!['user', 'power_user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await db.query(
      `INSERT INTO users (id, email, display_name, role, is_enabled, password_hash)
       VALUES ($1, $2, $3, $4, true, $5)
       RETURNING id, email, display_name, role, is_enabled, created_at`,
      [uuidv4(), email.trim().toLowerCase(), display_name.trim(), role, passwordHash]
    );
    await db.query(
      `INSERT INTO activity_logs (id, user_id, event_type, metadata, ip_address)
       VALUES ($1, $2, 'user_created', $3, $4)`,
      [uuidv4(), req.user.id, JSON.stringify({ newUserId: result.rows[0].id, role }), req.ip]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    console.error('[POST /api/users] error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PATCH /api/users/:id — update user
router.patch('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { display_name, role, is_enabled, password } = req.body;

  const fields = [];
  const values = [];
  let idx = 1;
  const changed = [];

  if (typeof password === 'string' && password.length > 0) {
    const passwordHash = await bcrypt.hash(password, 12);
    fields.push(`password_hash = $${idx++}`);
    values.push(passwordHash);
    changed.push('password');
  }

  if (typeof display_name === 'string') {
    fields.push(`display_name = $${idx++}`);
    values.push(display_name.trim());
    changed.push('display_name');
  }
  if (typeof role === 'string') {
    if (!['user', 'power_user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    fields.push(`role = $${idx++}`);
    values.push(role);
    changed.push('role');
  }
  if (typeof is_enabled === 'boolean') {
    fields.push(`is_enabled = $${idx++}`);
    values.push(is_enabled);
    changed.push('is_enabled');
  }

  if (fields.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  fields.push(`updated_at = now()`);
  values.push(id);

  try {
    const result = await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, email, display_name, role, is_enabled, created_at`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    // Invalidate sessions
    await db.query('DELETE FROM sessions WHERE user_id = $1', [id]);
    await db.query(
      `INSERT INTO activity_logs (id, user_id, event_type, metadata, ip_address)
       VALUES ($1, $2, 'session_invalidated', $3, $4)`,
      [uuidv4(), req.user.id, JSON.stringify({ targetUserId: id }), req.ip]
    );
    await db.query(
      `INSERT INTO activity_logs (id, user_id, event_type, metadata, ip_address)
       VALUES ($1, $2, 'user_modified', $3, $4)`,
      [uuidv4(), req.user.id, JSON.stringify({ targetUserId: id, fields_changed: changed }), req.ip]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('[PATCH /api/users/:id] error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account' });

  try {
    await db.query('DELETE FROM sessions WHERE user_id = $1', [id]);
    await db.query(
      `INSERT INTO activity_logs (id, user_id, event_type, metadata, ip_address)
       VALUES ($1, $2, 'session_invalidated', $3, $4)`,
      [uuidv4(), req.user.id, JSON.stringify({ targetUserId: id }), req.ip]
    );
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    await db.query(
      `INSERT INTO activity_logs (id, user_id, event_type, metadata, ip_address)
       VALUES ($1, $2, 'user_deleted', $3, $4)`,
      [uuidv4(), req.user.id, JSON.stringify({ targetUserId: id }), req.ip]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/users/:id] error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
