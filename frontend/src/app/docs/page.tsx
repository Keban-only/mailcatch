import { Header } from '@/components/landing/Header';

export default function DocsPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">API Documentation</h1>

        <div className="space-y-12">
          {/* Getting Started */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Getting Started</h2>
            <p className="text-slate-600 mb-4">
              MailCatch provides a simple REST API for creating temporary email inboxes and receiving messages.
              Perfect for automated testing of signup flows, OTP verification, and password resets.
            </p>
            <div className="bg-slate-900 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-2">Base URL</p>
              <code className="text-green-400">https://mailcatch.dev/api</code>
            </div>
          </section>

          {/* Authentication */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Authentication</h2>
            <p className="text-slate-600 mb-4">
              All API requests require an API key passed in the <code className="bg-slate-100 px-2 py-0.5 rounded text-sm">X-API-Key</code> header.
            </p>
            <div className="bg-slate-900 rounded-lg p-4">
              <pre className="text-slate-300 text-sm overflow-x-auto">{`curl -H "X-API-Key: mc_your_key_here" \\
  https://mailcatch.dev/api/inboxes`}</pre>
            </div>
          </section>

          {/* Create Inbox */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Create Inbox</h2>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">POST</span>
              <code className="text-slate-700">/api/inboxes</code>
            </div>
            <p className="text-slate-600 mb-4">
              Creates a new temporary email inbox. Returns the inbox ID and email address.
            </p>
            <div className="bg-slate-900 rounded-lg p-4 mb-4">
              <p className="text-slate-400 text-sm mb-2">Request</p>
              <pre className="text-slate-300 text-sm overflow-x-auto">{`curl -X POST https://mailcatch.dev/api/inboxes \\
  -H "X-API-Key: mc_your_key_here"`}</pre>
            </div>
            <div className="bg-slate-900 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-2">Response</p>
              <pre className="text-slate-300 text-sm overflow-x-auto">{`{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "address": "a1b2c3d4e5f6g7h8@mailcatch.dev",
  "is_active": true,
  "message_count": 0,
  "created_at": "2026-07-20T10:30:00.000Z",
  "expires_at": "2026-07-21T10:30:00.000Z"
}`}</pre>
            </div>
          </section>

          {/* Wait for Message */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Wait for Message (Long Polling)</h2>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">GET</span>
              <code className="text-slate-700">{'/api/inboxes/{id}/wait'}</code>
            </div>
            <p className="text-slate-600 mb-4">
              Waits for a new message to arrive. Returns immediately if a message is already present.
              Times out after 30 seconds (configurable with <code className="bg-slate-100 px-2 py-0.5 rounded text-sm">?timeout=60</code>).
            </p>
            <div className="bg-slate-900 rounded-lg p-4 mb-4">
              <p className="text-slate-400 text-sm mb-2">Request</p>
              <pre className="text-slate-300 text-sm overflow-x-auto">{`curl https://mailcatch.dev/api/inboxes/550e8400-.../wait \\
  -H "X-API-Key: mc_your_key_here"`}</pre>
            </div>
            <div className="bg-slate-900 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-2">Response</p>
              <pre className="text-slate-300 text-sm overflow-x-auto">{`{
  "id": "msg-uuid-here",
  "from_address": "noreply@example.com",
  "subject": "Your verification code",
  "otp_code": "482913",
  "received_at": "2026-07-20T10:31:05.000Z"
}`}</pre>
            </div>
          </section>

          {/* Get Messages */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">List Messages</h2>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">GET</span>
              <code className="text-slate-700">{'/api/inboxes/{id}/messages'}</code>
            </div>
            <p className="text-slate-600 mb-4">Returns all messages received by the inbox.</p>
            <div className="bg-slate-900 rounded-lg p-4">
              <pre className="text-slate-300 text-sm overflow-x-auto">{`{
  "data": [
    {
      "id": "msg-uuid",
      "from_address": "noreply@example.com",
      "subject": "Your verification code",
      "otp_code": "482913",
      "received_at": "2026-07-20T10:31:05.000Z"
    }
  ]
}`}</pre>
            </div>
          </section>

          {/* Playwright Example */}
          <section id="playwright">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Playwright Example</h2>
            <div className="bg-slate-900 rounded-lg p-4">
              <pre className="text-slate-300 text-sm overflow-x-auto">{`import { test, expect } from '@playwright/test';

test('user signup with OTP', async ({ page, request }) => {
  // Create inbox
  const inbox = await (await request.post('https://mailcatch.dev/api/inboxes', {
    headers: { 'X-API-Key': process.env.MAILCATCH_KEY! }
  })).json();

  // Fill signup form
  await page.goto('https://your-app.com/signup');
  await page.fill('#email', inbox.address);
  await page.fill('#password', 'SecurePass123!');
  await page.click('button[type="submit"]');

  // Wait for OTP email
  const message = await (await request.get(
    \`https://mailcatch.dev/api/inboxes/\${inbox.id}/wait\`
  )).json();

  // Enter OTP and verify
  await page.fill('#otp', message.otp_code);
  await page.click('#verify');
  await expect(page.locator('.welcome')).toBeVisible();
});`}</pre>
            </div>
          </section>

          {/* Cypress Example */}
          <section id="cypress">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Cypress Example</h2>
            <div className="bg-slate-900 rounded-lg p-4">
              <pre className="text-slate-300 text-sm overflow-x-auto">{`describe('Signup', () => {
  it('verifies email with OTP', () => {
    cy.request({
      method: 'POST',
      url: 'https://mailcatch.dev/api/inboxes',
      headers: { 'X-API-Key': Cypress.env('MAILCATCH_KEY') }
    }).then(({ body: inbox }) => {
      cy.visit('/signup');
      cy.get('#email').type(inbox.address);
      cy.get('#password').type('SecurePass123!');
      cy.get('form').submit();

      cy.request(\`https://mailcatch.dev/api/inboxes/\${inbox.id}/wait\`)
        .then(({ body: msg }) => {
          cy.get('#otp').type(msg.otp_code);
          cy.get('#verify').click();
          cy.contains('Welcome').should('be.visible');
        });
    });
  });
});`}</pre>
            </div>
          </section>

          {/* Rate Limits */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Rate Limits</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">Plan</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">Inboxes/month</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">API Keys</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">Retention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-3">Free</td>
                    <td className="px-4 py-3">100</td>
                    <td className="px-4 py-3">1</td>
                    <td className="px-4 py-3">24 hours</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Pro</td>
                    <td className="px-4 py-3">5,000</td>
                    <td className="px-4 py-3">5</td>
                    <td className="px-4 py-3">7 days</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Team</td>
                    <td className="px-4 py-3">50,000</td>
                    <td className="px-4 py-3">Unlimited</td>
                    <td className="px-4 py-3">30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
