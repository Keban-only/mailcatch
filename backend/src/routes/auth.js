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
