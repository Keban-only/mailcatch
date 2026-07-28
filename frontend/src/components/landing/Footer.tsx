import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-lg text-white">MailCatch</span>
            </div>
            <p className="text-sm">
              Email API for automated testing. Built for QA engineers.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#features" className="hover:text-white transition">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-white transition">Pricing</Link></li>
              <li><Link href="/docs" className="hover:text-white transition">Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Integrations</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/docs#playwright" className="hover:text-white transition">Playwright</Link></li>
              <li><Link href="/docs#cypress" className="hover:text-white transition">Cypress</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:support@mailcatch.dev" className="hover:text-white transition">Contact</a></li>
              <li><a href="https://github.com/Keban-only/mailcatch" className="hover:text-white transition">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-sm text-center">
          &copy; {new Date().getFullYear()} MailCatch. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
