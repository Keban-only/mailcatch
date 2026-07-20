const express = require('express');
const db = require('../models/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT u.id, u.email, u.name, u.role, u.plan, u.created_at,
              (SELECT COUNT(*) FROM inboxes WHERE user_id = u.id) as inbox_count,
              (SELECT COUNT(*) FROM api_keys WHERE user_id = u.id AND is_active = true) as key_count
       FROM users u ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.query('SELECT COUNT(*) as total FROM users');

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

router.get('/stats', async (req, res, next) => {
  try {
    const stats = {};

    const usersResult = await db.query('SELECT COUNT(*) as total FROM users');
    stats.total_users = parseInt(usersResult.rows[0].total);

    const inboxesResult = await db.query(
      "SELECT COUNT(*) as total FROM inboxes WHERE created_at > NOW() - INTERVAL '24 hours'"
    );
    stats.inboxes_today = parseInt(inboxesResult.rows[0].total);

    const messagesResult = await db.query(
      "SELECT COUNT(*) as total FROM messages WHERE received_at > NOW() - INTERVAL '24 hours'"
    );
    stats.messages_today = parseInt(messagesResult.rows[0].total);

    const plansResult = await db.query(
      'SELECT plan, COUNT(*) as count FROM users GROUP BY plan'
    );
    stats.plans = {};
    plansResult.rows.forEach((row) => {
      stats.plans[row.plan] = parseInt(row.count);
    });

    const weeklyResult = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM inboxes WHERE created_at > NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at) ORDER BY date`
    );
    stats.weekly_inboxes = weeklyResult.rows;

    res.json(stats);
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id', async (req, res, next) => {
  try {
    const { plan, role } = req.body;
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (plan) {
      updates.push(`plan = $${paramIndex++}`);
      values.push(plan);
    }
    if (role) {
      updates.push(`role = $${paramIndex++}`);
      values.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(req.params.id);

    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, name, role, plan`,
      values
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
