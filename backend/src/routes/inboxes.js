const express = require('express');
const crypto = require('crypto');
const db = require('../models/db');
const { authenticateApiKey } = require('../middleware/auth');
const { getPlanLimits } = require('../utils/plans');

const router = express.Router();

router.use(authenticateApiKey);

router.post('/', async (req, res, next) => {
  try {
    const limits = getPlanLimits(req.user.plan);

    const usageResult = await db.query(
      `SELECT COUNT(*) as count FROM inboxes
       WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'`,
      [req.user.id]
    );

    const currentUsage = parseInt(usageResult.rows[0].count);
    if (currentUsage >= limits.maxInboxesPerMonth) {
      return res.status(429).json({
        error: 'Monthly inbox limit reached',
        limit: limits.maxInboxesPerMonth,
        used: currentUsage,
        upgrade_url: '/pricing',
      });
    }

    const prefix = crypto.randomBytes(8).toString('hex');
    const domain = process.env.MAIL_DOMAIN || 'mailcatch.dev';
    const address = `${prefix}@${domain}`;
    const name = req.body.name || null;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + limits.messageRetentionHours);

    const result = await db.query(
      'INSERT INTO inboxes (user_id, address, name, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, address, name, expiresAt]
    );

    await db.query(
      "INSERT INTO usage_log (user_id, action) VALUES ($1, 'inbox_created')",
      [req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;

    const result = await db.query(
      'SELECT * FROM inboxes WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user.id, limit, offset]
    );

    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM inboxes WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM inboxes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inbox not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'DELETE FROM inboxes WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inbox not found' });
    }

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
