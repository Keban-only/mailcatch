# MailCatch

**Email API for Automated Testing**

Create temporary email inboxes via API, receive messages, auto-extract OTP codes. Built for QA engineers and CI/CD pipelines.

---

## What it does

- `POST /api/inboxes` — create a unique email address
- `GET /api/inboxes/{id}/wait` — wait for incoming email (long polling)
- Auto-parse OTP/verification codes from email body
- Webhooks for real-time notifications
- Dashboard for visual inbox/message management

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Email | SMTP server (smtp-server) |
| Frontend | Next.js 14, Tailwind CSS |
| Auth | JWT + bcrypt |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Security | Gitleaks, Semgrep, Trivy, OWASP ZAP |

---

## Security Pipeline

```
PR opened → secrets scan → lint & tests → SAST → SCA → container scan
                                                              │
merge to main → all above + DAST (OWASP ZAP) → deploy
```

| Stage | Tool | What it catches |
|-------|------|-----------------|
| Secrets | Gitleaks | API keys, passwords committed to code |
| SAST | Semgrep | SQL injection, XSS, insecure patterns |
| SCA | Trivy + npm audit | Known CVEs in dependencies |
| Container | Trivy | Vulnerabilities in Docker image layers |
| DAST | OWASP ZAP | Runtime vulnerabilities (XSS, SQLi, CSRF) |

**Gate policy:** PR is blocked if severity >= HIGH.

---

## Run Locally

```bash
# Clone
git clone https://github.com/Keban-only/mailcatch.git
cd mailcatch

# Start backend + database
docker compose up --build

# Run migrations
docker compose exec backend node migrations/run.js
docker compose exec backend node migrations/seed.js

# Start frontend (in another terminal)
cd frontend
npm install
npm run dev
```

- API: http://localhost:3001
- Frontend: http://localhost:3000
- SMTP: localhost:2525

---

## API Usage Example

```typescript
// Playwright test
import { test, expect } from '@playwright/test';

test('signup with OTP verification', async ({ page, request }) => {
  // Create temporary inbox
  const inbox = await (await request.post('https://mailcatch.dev/api/inboxes', {
    headers: { 'X-API-Key': process.env.MAILCATCH_KEY }
  })).json();

  // Use email in signup form
  await page.fill('#email', inbox.address);
  await page.click('#submit');

  // Wait for verification email
  const msg = await (await request.get(
    `https://mailcatch.dev/api/inboxes/${inbox.id}/wait`
  )).json();

  // OTP is auto-extracted
  await page.fill('#otp', msg.otp_code);
  await page.click('#verify');

  await expect(page.locator('.welcome')).toBeVisible();
});
```

---

## Project Structure

```
mailcatch/
├── backend/
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/    # Auth, rate limiting
│   │   ├── services/     # SMTP server, webhooks
│   │   ├── models/       # Database
│   │   └── utils/        # OTP parser, plan limits
│   ├── migrations/       # DB schema + seed
│   └── Dockerfile
├── frontend/
│   └── src/
│       ├── app/          # Pages (landing, dashboard, auth)
│       ├── components/   # UI components
│       └── lib/          # API client
├── .github/workflows/    # CI/CD pipeline
└── docker-compose.yml
```

---

## Pricing

| Plan | Price | Inboxes/month | Retention |
|------|-------|---------------|-----------|
| Free | $0 | 100 | 24 hours |
| Pro | $9/mo | 5,000 | 7 days |
| Team | $29/mo | 50,000 | 30 days |

---

## License

Proprietary. All rights reserved.
