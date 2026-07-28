const express = require('express');
const crypto = require('crypto');
const db = require('../models/db');
const { authenticateToken } = require('../middleware/auth');
const { getPlanLimits } = require('../utils/plans');

const router = express.Router();

router.use(authenticateToken);

router.post('/', async (req, res, next) => {
  try {
    const limits = getPlanLimits(req.user.plan);

    const countResult = await db.query(
      'SELECT COUNT(*) as count FROM api_keys WHERE user_id = $1 AND is_active = true',
      [req.user.id]
    );

    const currentCount = parseInt(countResult.rows[0].count);
    if (limits.maxApiKeys > 0 && currentCount >= limits.maxApiKeys) {
      return res.status(429).json({
        error: 'API key limit reached',
        limit: limits.maxApiKeys,
        current: currentCount,
      });
    }

    const key = `mc_${crypto.randomBytes(24).toString('hex')}`;
    const name = req.body.name || 'API Key';

    const result = await db.query(
      'INSERT INTO api_keys (user_id, key, name) VALUES ($1, $2, $3) RETURNING id, key, name, is_active, created_at',
      [req.user.id, key, name]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, name, is_active, created_at, last_used_at, CONCAT(LEFT(key, 6), \'...\') as key_preview FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const keyResult = await db.query(
      'SELECT id, name FROM api_keys WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (keyResult.rows.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    if (keyResult.rows[0].name === 'Default') {
      return res.status(403).json({ error: 'Cannot revoke the default API key' });
    }

    await db.query(
      'UPDATE api_keys SET is_active = false WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    res.json({ revoked: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
