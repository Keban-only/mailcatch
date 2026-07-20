const express = require('express');
const db = require('../models/db');
const { authenticateToken } = require('../middleware/auth');
const { getPlanLimits } = require('../utils/plans');

const router = express.Router();

router.use(authenticateToken);

router.post('/', async (req, res, next) => {
  try {
    const limits = getPlanLimits(req.user.plan);

    if (!limits.webhooks) {
      return res.status(403).json({
        error: 'Webhooks are not available on the free plan',
        upgrade_url: '/pricing',
      });
    }

    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Webhook URL is required' });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const result = await db.query(
      'INSERT INTO webhooks (user_id, url) VALUES ($1, $2) RETURNING *',
      [req.user.id, url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM webhooks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'DELETE FROM webhooks WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
