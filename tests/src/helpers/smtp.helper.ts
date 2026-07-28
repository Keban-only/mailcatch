/**
 * SmtpHelper — відправка тестових emails через SMTP.
 * Реалізує правильний SMTP handshake (чекає greeting перед командами).
 * Використовується для інтеграційних тестів прийому пошти.
 */

import * as net from 'net';

export interface EmailOptions {
  to: string;
  from?: string;
  subject: string;
  body: string;
  html?: string;
}

export class SmtpHelper {
  constructor(
    private host: string = 'localhost',
    private port: number = 2525
  ) {}

  async sendEmail(opts: EmailOptions): Promise<void> {
    const from = opts.from || 'test@example.com';

    return new Promise((resolve, reject) => {
      const client = net.createConnection(this.port, this.host);
      let step = 0;
      const timer = setTimeout(() => {
        client.destroy();
        reject(new Error(`SMTP timeout sending to ${opts.to}`));
      }, 10000);

      client.on('data', (data: Buffer) => {
        const response = data.toString();

        if (step === 0 && response.startsWith('220')) {
          step = 1;
          client.write('EHLO playwright\r\n');
        } else if (step === 1 && response.includes('250')) {
          step = 2;
          client.write(`MAIL FROM:<${from}>\r\n`);
        } else if (step === 2 && response.startsWith('250')) {
          step = 3;
          client.write(`RCPT TO:<${opts.to}>\r\n`);
        } else if (step === 3 && response.startsWith('250')) {
          step = 4;
          client.write('DATA\r\n');
        } else if (step === 4 && response.startsWith('354')) {
          step = 5;
          const contentType = opts.html
            ? 'Content-Type: text/html; charset=utf-8'
            : 'Content-Type: text/plain; charset=utf-8';
          const content = opts.html || opts.body;
          client.write(
            `From: ${from}\r\nTo: ${opts.to}\r\nSubject: ${opts.subject}\r\n${contentType}\r\n\r\n${content}\r\n.\r\n`
          );
        } else if (step === 5 && response.startsWith('250')) {
          step = 6;
          client.write('QUIT\r\n');
        } else if (step === 6) {
          clearTimeout(timer);
          client.end();
          resolve();
        }
      });

      client.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  async sendOtpEmail(to: string, code: string): Promise<void> {
    return this.sendEmail({
      to,
      subject: 'Your verification code',
      body: `Your OTP code is ${code}. Do not share it with anyone.`,
    });
  }

  async sendHtmlEmail(to: string, subject: string, html: string): Promise<void> {
    return this.sendEmail({ to, subject, body: '', html });
  }
}
