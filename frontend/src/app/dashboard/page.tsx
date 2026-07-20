'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Inbox {
  id: string;
  address: string;
  name: string | null;
  message_count: number;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [inboxes, setInboxes] = useState<Inbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      window.location.href = '/auth/login';
      return;
    }
    setUser(JSON.parse(stored));
    loadInboxes();
  }, []);

  async function loadInboxes() {
    try {
      const token = localStorage.getItem('token');
      const data = await api('/api/inboxes', { token: token! });
      setInboxes(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createInbox() {
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      await api('/api/inboxes', { method: 'POST', token: token! });
      await loadInboxes();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
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
              <Link href="/dashboard" className="text-brand-600 font-medium">Inboxes</Link>
              <Link href="/dashboard/keys" className="text-slate-600 hover:text-slate-900">API Keys</Link>
              <Link href="/dashboard/settings" className="text-slate-600 hover:text-slate-900">Settings</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              {user?.plan === 'free' ? 'Free' : user?.plan} plan
            </span>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Inboxes</h1>
            <p className="text-slate-600">Create and manage your test email addresses</p>
          </div>
          <button
            onClick={createInbox}
            disabled={creating}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition font-medium disabled:opacity-50"
          >
            {creating ? 'Creating...' : '+ New Inbox'}
          </button>
        </div>

        {inboxes.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No inboxes yet</h3>
            <p className="text-slate-600 mb-4">Create your first inbox to start receiving test emails</p>
            <button
              onClick={createInbox}
              className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition font-medium"
            >
              Create First Inbox
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Address</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Messages</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Created</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inboxes.map((inbox) => (
                  <tr key={inbox.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-slate-100 px-2 py-1 rounded">{inbox.address}</code>
                        <button
                          onClick={() => copyToClipboard(inbox.address)}
                          className="text-slate-400 hover:text-slate-600"
                          title="Copy"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{inbox.message_count}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(inbox.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/inbox/${inbox.id}`}
                        className="text-brand-600 hover:underline text-sm font-medium"
                      >
                        View Messages
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
