import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

export default function TermsPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: July 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1. Service Description</h2>
            <p>
              MailCatch provides temporary email inboxes for automated testing purposes. The service includes
              an API for programmatic access, a web dashboard, and SMTP email receiving.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2. Acceptable Use</h2>
            <p>You agree to use MailCatch only for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Automated software testing (unit, integration, E2E)</li>
              <li>CI/CD pipeline email verification</li>
              <li>Development and QA workflows</li>
            </ul>
            <p className="mt-3">You may <strong>not</strong> use MailCatch for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Receiving personal or business correspondence</li>
              <li>Spam, phishing, or any illegal activity</li>
              <li>Circumventing sign-up restrictions on other services</li>
              <li>Storing sensitive personal data (PII, healthcare, financial)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">3. Service Limits</h2>
            <p>
              Each plan has defined limits for inbox creation, API keys, and message retention.
              Exceeding limits will result in rejected requests (HTTP 429) until the billing cycle resets.
              Deleting inboxes does not restore your monthly quota.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">4. Data Retention</h2>
            <p>
              Messages are automatically deleted after the retention period defined by your plan.
              We reserve the right to delete inactive accounts (no API calls for 90+ days) after
              sending a warning email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">5. Availability</h2>
            <p>
              We aim for 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance
              will be announced at least 24 hours in advance. We are not liable for data loss due to
              service outages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">6. Account Termination</h2>
            <p>
              We may suspend or terminate accounts that violate these terms. You may delete your account
              at any time — all associated data will be permanently removed within 24 hours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">7. Changes</h2>
            <p>
              We may update these terms. Continued use after changes constitutes acceptance.
              Material changes will be communicated via email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">8. Contact</h2>
            <p>
              Questions about these terms? Email us at{' '}
              <a href="mailto:support@mailcatch.dev" className="text-brand-600 hover:underline">support@mailcatch.dev</a>.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
