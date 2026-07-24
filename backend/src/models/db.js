const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  // nosemgrep: javascript.lang.security.audit.sqli.node-postgres-sqli
  query: (text, params) => pool.query(text, params),
  pool,
};
