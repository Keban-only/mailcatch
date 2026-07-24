'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-xl text-slate-900">MailCatch</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-slate-600 hover:text-slate-900 transition">
              Features
            </Link>
            <Link href="/#pricing" className="text-slate-600 hover:text-slate-900 transition">
              Pricing
            </Link>
            <Link href="/docs" className="text-slate-600 hover:text-slate-900 transition">
              Docs
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition font-medium"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-slate-600 hover:text-slate-900 transition"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition font-medium"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <nav className="flex flex-col gap-4">
              <Link href="/#features" className="text-slate-600">Features</Link>
              <Link href="/#pricing" className="text-slate-600">Pricing</Link>
              <Link href="/docs" className="text-slate-600">Docs</Link>
              {isLoggedIn ? (
                <Link href="/dashboard" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-center font-medium">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="text-slate-600">Log in</Link>
                  <Link href="/auth/register" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-center font-medium">
                    Get Started Free
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
