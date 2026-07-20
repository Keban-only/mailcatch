require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const inboxRoutes = require('./routes/inboxes');
const messageRoutes = require('./routes/messages');
const keyRoutes = require('./routes/keys');
const webhookRoutes = require('./routes/webhooks');
const adminRoutes = require('./routes/admin');
const { startSmtpServer } = require('./services/smtp');
const db = require('./models/db');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());
app.use(morgan('short'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/inboxes', inboxRoutes);
app.use('/api/inboxes', messageRoutes);
app.use('/api/keys', keyRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'mailcatch-api' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`MailCatch API running on port ${PORT}`);
  startSmtpServer();
});
