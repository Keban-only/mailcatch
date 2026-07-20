require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { pool } = require('../src/models/db');

async function seed() {
  try {
    const adminPassword = await bcrypt.hash('admin123456', 12);
    const adminResult = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, plan)
       VALUES ('admin@mailcatch.dev', $1, 'Admin', 'admin', 'team')
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [adminPassword]
    );

    if (adminResult.rows.length > 0) {
      const adminId = adminResult.rows[0].id;
      const adminKey = `mc_${crypto.randomBytes(24).toString('hex')}`;
      await pool.query(
        'INSERT INTO api_keys (user_id, key, name) VALUES ($1, $2, $3)',
        [adminId, adminKey, 'Admin Key']
      );
      console.log(`Admin created. API Key: ${adminKey}`);
    }

    const testPassword = await bcrypt.hash('test123456', 12);
    const testResult = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, plan)
       VALUES ('test@mailcatch.dev', $1, 'Test User', 'user', 'free')
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [testPassword]
    );

    if (testResult.rows.length > 0) {
      const testId = testResult.rows[0].id;
      const testKey = `mc_${crypto.randomBytes(24).toString('hex')}`;
      await pool.query(
        'INSERT INTO api_keys (user_id, key, name) VALUES ($1, $2, $3)',
        [testId, testKey, 'Default']
      );
      console.log(`Test user created. API Key: ${testKey}`);
    }

    console.log('Seed completed');
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
