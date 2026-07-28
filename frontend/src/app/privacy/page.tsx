import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: July 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1. What We Collect</h2>
            <p>When you create an account, we collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email address (for authentication)</li>
              <li>Name (optional)</li>
              <li>Usage data (inbox creation count, API calls)</li>
            </ul>
            <p className="mt-3">
              Emails received by your inboxes are stored temporarily according to your plan's retention period
              (24 hours for Free, 7 days for Pro, 30 days for Team) and then permanently deleted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2. How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide the email testing service</li>
              <li>Enforce plan limits and usage quotas</li>
              <li>Send service-related notifications (downtime, plan changes)</li>
            </ul>
            <p className="mt-3">We do not sell your data to third parties. We do not use your data for advertising.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">3. Data Storage</h2>
            <p>
              Your data is stored on encrypted servers. Passwords are hashed with bcrypt (12 rounds).
              API keys are stored as-is but shown only once at creation — we display a preview after that.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">4. Email Content</h2>
            <p>
              MailCatch is designed for <strong>test emails only</strong>. Emails sent to your inboxes are stored
              for the retention period, then permanently deleted. We do not read, analyze, or share email content
              beyond providing the service (OTP extraction, webhook delivery).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">5. Your Rights</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Request a copy of your data</li>
              <li>Delete your account and all associated data</li>
              <li>Export your inbox history</li>
            </ul>
            <p className="mt-3">
              Contact <a href="mailto:support@mailcatch.dev" className="text-brand-600 hover:underline">support@mailcatch.dev</a> for any privacy requests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">6. Cookies</h2>
            <p>
              We use localStorage for authentication tokens. We do not use tracking cookies or third-party analytics.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
