const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const db = require('../models/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, role, plan, created_at',
      [email.toLowerCase(), passwordHash, name || null]
    );

    const user = result.rows[0];

    const apiKey = `mc_${crypto.randomBytes(24).toString('hex')}`;
    await db.query(
      'INSERT INTO api_keys (user_id, key, name) VALUES ($1, $2, $3)',
      [user.id, apiKey, 'Default']
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, plan: user.plan },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      user,
      token,
      api_key: apiKey,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await db.query(
      'SELECT id, email, password_hash, name, role, plan FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, plan: user.plan },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password_hash, ...userData } = user;
    res.json({ user: userData, token });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, email, role, plan FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, plan: user.plan },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
});

router.patch('/profile', authenticateToken, async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }
      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters' });
      }
      const hash = await bcrypt.hash(newPassword, 12);
      await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);
    }

    if (email && email.toLowerCase() !== user.email) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change email' });
      }
      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      await db.query('UPDATE users SET email = $1 WHERE id = $2', [email.toLowerCase(), userId]);
    }

    if (name !== undefined) {
      await db.query('UPDATE users SET name = $1 WHERE id = $2', [name || null, userId]);
    }

    const updated = await db.query(
      'SELECT id, email, name, role, plan, created_at FROM users WHERE id = $1',
      [userId]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, email, name, role, plan, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
