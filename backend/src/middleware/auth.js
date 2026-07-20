const jwt = require('jsonwebtoken');
const db = require('../models/db');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

async function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return authenticateToken(req, res, next);
  }

  try {
    const result = await db.query(
      'SELECT ak.*, u.id as user_id, u.plan, u.role FROM api_keys ak JOIN users u ON ak.user_id = u.id WHERE ak.key = $1 AND ak.is_active = true',
      [apiKey]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const key = result.rows[0];
    req.user = { id: key.user_id, plan: key.plan, role: key.role };

    await db.query('UPDATE api_keys SET last_used_at = NOW() WHERE id = $1', [key.id]);

    next();
  } catch (err) {
    next(err);
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { authenticateToken, authenticateApiKey, requireAdmin };
