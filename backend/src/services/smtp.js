const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const db = require('../models/db');
const { extractOtp } = require('../utils/otp');
const { notifyWebhooks } = require('./webhooks');

function startSmtpServer() {
  const server = new SMTPServer({
    secure: false,
    authOptional: true,
    disabledCommands: ['AUTH'],
    onData(stream, session, callback) {
      let emailData = '';

      stream.on('data', (chunk) => {
        emailData += chunk.toString();
      });

      stream.on('end', async () => {
        try {
          const parsed = await simpleParser(emailData);
          const recipients = session.envelope.rcptTo.map((r) => r.address.toLowerCase());

          for (const recipient of recipients) {
            const inboxResult = await db.query(
              'SELECT id, user_id FROM inboxes WHERE address = $1 AND is_active = true',
              [recipient]
            );

            if (inboxResult.rows.length === 0) continue;

            const inbox = inboxResult.rows[0];
            const bodyText = parsed.text || '';
            const bodyHtml = parsed.html || '';
            const otpCode = extractOtp(bodyText) || extractOtp(parsed.subject || '');

            const msgResult = await db.query(
              `INSERT INTO messages (inbox_id, from_address, subject, body_text, body_html, otp_code, headers)
               VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
              [
                inbox.id,
                parsed.from?.text || session.envelope.mailFrom.address,
                parsed.subject || '(no subject)',
                bodyText,
                bodyHtml,
                otpCode,
                JSON.stringify(parsed.headers ? Object.fromEntries(parsed.headers) : {}),
              ]
            );

            await db.query(
              'UPDATE inboxes SET message_count = message_count + 1 WHERE id = $1',
              [inbox.id]
            );

            notifyWebhooks(inbox.user_id, {
              event: 'message.received',
              inbox_id: inbox.id,
              message_id: msgResult.rows[0].id,
              from: parsed.from?.text,
              subject: parsed.subject,
              otp_code: otpCode,
            });
          }

          callback();
        } catch (err) {
          console.error('SMTP processing error:', err);
          callback(err);
        }
      });
    },
  });

  const SMTP_PORT = process.env.SMTP_PORT || 2525;
  server.listen(SMTP_PORT, () => {
    console.log(`SMTP server running on port ${SMTP_PORT}`);
  });

  server.on('error', (err) => {
    console.error('SMTP server error:', err);
  });

  return server;
}

module.exports = { startSmtpServer };
