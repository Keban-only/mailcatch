const express = require('express');
const db = require('../models/db');
const { authenticateApiKey } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateApiKey);

router.get('/:id/messages', async (req, res, next) => {
  try {
    const inboxResult = await db.query(
      'SELECT id FROM inboxes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (inboxResult.rows.length === 0) {
      return res.status(404).json({ error: 'Inbox not found' });
    }

    const result = await db.query(
      'SELECT id, from_address, subject, otp_code, received_at FROM messages WHERE inbox_id = $1 ORDER BY received_at DESC',
      [req.params.id]
    );

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/messages/:messageId', async (req, res, next) => {
  try {
    const inboxResult = await db.query(
      'SELECT id FROM inboxes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (inboxResult.rows.length === 0) {
      return res.status(404).json({ error: 'Inbox not found' });
    }

    const result = await db.query(
      'SELECT * FROM messages WHERE id = $1 AND inbox_id = $2',
      [req.params.messageId, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/wait', async (req, res, next) => {
  try {
    const inboxResult = await db.query(
      'SELECT id FROM inboxes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (inboxResult.rows.length === 0) {
      return res.status(404).json({ error: 'Inbox not found' });
    }

    const timeout = Math.min(parseInt(req.query.timeout) || 30, 60) * 1000;
    const since = req.query.since || new Date(0).toISOString();
    const startTime = Date.now();

    const poll = async () => {
      const result = await db.query(
        'SELECT id, from_address, subject, otp_code, received_at FROM messages WHERE inbox_id = $1 AND received_at > $2 ORDER BY received_at DESC LIMIT 1',
        [req.params.id, since]
      );

      if (result.rows.length > 0) {
        return res.json(result.rows[0]);
      }

      if (Date.now() - startTime >= timeout) {
        return res.status(408).json({ error: 'Timeout waiting for message' });
      }

      setTimeout(poll, 1000);
    };

    poll();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
