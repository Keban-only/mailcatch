import Link from 'next/link';

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium mb-6">
          Free tier — 100 inboxes/month
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
          Email API for{' '}
          <span className="text-brand-600">Automated Testing</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Create temporary inboxes, receive emails, auto-extract OTP codes.
          One API call in your Playwright, Cypress, or Selenium tests.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/auth/register"
            className="bg-brand-600 text-white px-8 py-3 rounded-lg hover:bg-brand-700 transition font-semibold text-lg"
          >
            Start for Free
          </Link>
          <Link
            href="/docs"
            className="border border-slate-300 text-slate-700 px-8 py-3 rounded-lg hover:bg-slate-50 transition font-semibold text-lg"
          >
            View Docs
          </Link>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 text-left max-w-2xl mx-auto shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-slate-500 text-sm">test.spec.ts</span>
          </div>
          <pre className="text-sm sm:text-base overflow-x-auto">
            <code className="text-slate-300">
{`// Create inbox
const inbox = await fetch('https://mailcatch.dev/api/inboxes', {
  method: 'POST',
  headers: { 'X-API-Key': process.env.MAILCATCH_KEY }
}).then(r => r.json());

// Use inbox.address for signup
await page.fill('#email', inbox.address);
await page.click('#submit');

// Wait for OTP email
const msg = await fetch(
  \`https://mailcatch.dev/api/inboxes/\${inbox.id}/wait\`
).then(r => r.json());

// msg.otp_code = "482913" ✓
await page.fill('#otp', msg.otp_code);`}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
