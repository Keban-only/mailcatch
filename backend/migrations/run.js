require('dotenv').config();
const { pool } = require('../src/models/db');

const migration = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user',
  plan VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(100) DEFAULT 'Default',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inboxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  address VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inbox_id UUID REFERENCES inboxes(id) ON DELETE CASCADE,
  from_address VARCHAR(255),
  subject VARCHAR(500),
  body_text TEXT,
  body_html TEXT,
  otp_code VARCHAR(20),
  headers JSONB,
  received_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inboxes_user_id ON inboxes(user_id);
CREATE INDEX IF NOT EXISTS idx_inboxes_address ON inboxes(address);
CREATE INDEX IF NOT EXISTS idx_messages_inbox_id ON messages(inbox_id);
CREATE INDEX IF NOT EXISTS idx_messages_received_at ON messages(received_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_user_id ON usage_log(user_id);
`;

async function run() {
  try {
    await pool.query(migration);
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

run();
