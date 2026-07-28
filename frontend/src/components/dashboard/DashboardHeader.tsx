'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  plan: string;
}

export function DashboardHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const navItems = [
    { href: '/dashboard', label: 'Inboxes' },
    { href: '/dashboard/keys', label: 'API Keys' },
    { href: '/dashboard/settings', label: 'Settings' },
  ];

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-lg text-slate-900">MailCatch</span>
          </Link>
          <nav className="hidden md:flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  (item.href === '/dashboard' ? pathname === '/dashboard' || pathname.startsWith('/dashboard/inbox') : pathname === item.href)
                  ? 'text-brand-600 font-medium'
                  : 'text-slate-600 hover:text-slate-900'}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              user.plan === 'team'
                ? 'bg-purple-100 text-purple-700'
                : user.plan === 'pro'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600'
            }`}>
              {user.plan === 'free' ? 'Free' : user.plan === 'pro' ? 'Pro' : 'Team'}
            </span>
          )}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
