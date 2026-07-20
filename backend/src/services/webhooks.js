const db = require('../models/db');

async function notifyWebhooks(userId, payload) {
  try {
    const result = await db.query(
      'SELECT url FROM webhooks WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    for (const webhook of result.rows) {
      fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.error(`Webhook delivery failed to ${webhook.url}:`, err.message);
      });
    }
  } catch (err) {
    console.error('Webhook notification error:', err.message);
  }
}

module.exports = { notifyWebhooks };
