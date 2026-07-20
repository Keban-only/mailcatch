'use client';

import { useState } from 'react';

const examples = {
  playwright: {
    label: 'Playwright',
    code: `import { test, expect } from '@playwright/test';

test('user signup with OTP', async ({ page, request }) => {
  // 1. Create inbox
  const inbox = await request.post('https://mailcatch.dev/api/inboxes', {
    headers: { 'X-API-Key': process.env.MAILCATCH_KEY }
  }).then(r => r.json());

  // 2. Fill signup form
  await page.goto('https://myapp.com/signup');
  await page.fill('#email', inbox.address);
  await page.fill('#password', 'TestPass123!');
  await page.click('#submit');

  // 3. Wait for verification email
  const message = await request.get(
    \`https://mailcatch.dev/api/inboxes/\${inbox.id}/wait\`
  ).then(r => r.json());

  // 4. Enter OTP
  await page.fill('#otp-input', message.otp_code);
  await page.click('#verify');

  await expect(page.locator('#welcome')).toBeVisible();
});`,
  },
  cypress: {
    label: 'Cypress',
    code: `describe('Signup with email verification', () => {
  it('completes OTP flow', () => {
    // 1. Create inbox
    cy.request({
      method: 'POST',
      url: 'https://mailcatch.dev/api/inboxes',
      headers: { 'X-API-Key': Cypress.env('MAILCATCH_KEY') }
    }).then(({ body: inbox }) => {

      // 2. Fill signup form
      cy.visit('/signup');
      cy.get('#email').type(inbox.address);
      cy.get('#password').type('TestPass123!');
      cy.get('#submit').click();

      // 3. Wait for email
      cy.request(
        \`https://mailcatch.dev/api/inboxes/\${inbox.id}/wait\`
      ).then(({ body: message }) => {

        // 4. Enter OTP
        cy.get('#otp-input').type(message.otp_code);
        cy.get('#verify').click();
        cy.get('#welcome').should('be.visible');
      });
    });
  });
});`,
  },
  curl: {
    label: 'cURL',
    code: `# Create inbox
curl -X POST https://mailcatch.dev/api/inboxes \\
  -H "X-API-Key: mc_your_api_key_here"

# Response:
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "address": "a1b2c3d4e5f6g7h8@mailcatch.dev",
#   "created_at": "2024-01-15T10:30:00Z"
# }

# Wait for message (long polling, 30s timeout)
curl https://mailcatch.dev/api/inboxes/550e8400-.../wait

# Response:
# {
#   "id": "...",
#   "from_address": "noreply@myapp.com",
#   "subject": "Your verification code",
#   "otp_code": "482913"
# }`,
  },
};

export function CodeExample() {
  const [activeTab, setActiveTab] = useState<keyof typeof examples>('playwright');

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Works with your test framework
          </h2>
          <p className="text-lg text-slate-600">
            Add email testing to your existing tests in minutes.
          </p>
        </div>

        <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl">
          <div className="flex border-b border-slate-700">
            {Object.entries(examples).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as keyof typeof examples)}
                className={`px-6 py-3 text-sm font-medium transition ${
                  activeTab === key
                    ? 'text-white bg-slate-800 border-b-2 border-brand-500'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm">
              <code className="text-slate-300">{examples[activeTab].code}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
