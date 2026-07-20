import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'MailCatch — Email API for Automated Testing',
  description:
    'Create temporary email addresses with API. Receive emails, auto-parse OTP codes. Built for QA engineers and CI/CD pipelines.',
  keywords: [
    'email testing API',
    'temporary email',
    'email sandbox',
    'OTP testing',
    'automated testing email',
    'Playwright email',
    'Cypress email testing',
    'disposable email API',
  ],
  openGraph: {
    title: 'MailCatch — Email API for Automated Testing',
    description: 'Create inboxes, receive emails, extract OTP — all via API. Free tier included.',
    url: 'https://mailcatch.dev',
    siteName: 'MailCatch',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MailCatch — Email API for Automated Testing',
    description: 'Create inboxes, receive emails, extract OTP — all via API.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
