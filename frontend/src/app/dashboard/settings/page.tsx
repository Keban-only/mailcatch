'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/auth/login'; return; }
    setUser(JSON.parse(stored));
    loadWebhooks();
  }, []);

  async function loadWebhooks() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const data = await api('/api/webhooks', { token });
      setWebhooks(data.data);
    } catch {}
  }

  async function addWebhook() {
    if (!newWebhookUrl) return;
    const token = localStorage.getItem('token');
    try {
      await api('/api/webhooks', {
        method: 'POST',
        token: token!,
        body: JSON.stringify({ url: newWebhookUrl }),
      });
      setNewWebhookUrl('');
      loadWebhooks();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function deleteWebhook(id: string) {
    const token = localStorage.getItem('token');
    await api(`/api/webhooks/${id}`, { method: 'DELETE', token: token! });
    loadWebhooks();
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2 mr-6">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-lg text-slate-900">MailCatch</span>
          </Link>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">Inboxes</Link>
            <Link href="/dashboard/keys" className="text-slate-600 hover:text-slate-900">API Keys</Link>
            <Link href="/dashboard/settings" className="text-brand-600 font-medium">Settings</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-slate-500">Email</label>
              <p className="font-medium text-slate-900">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Name</label>
              <p className="font-medium text-slate-900">{user.name || '—'}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Plan</label>
              <p className="font-medium text-slate-900 capitalize">{user.plan}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Webhooks</h2>
          <p className="text-sm text-slate-600 mb-4">
            Get notified when an email arrives at any of your inboxes.
          </p>

          <div className="flex gap-3 mb-4">
            <input
              type="url"
              placeholder="https://your-server.com/webhook"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              onClick={addWebhook}
              className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700"
            >
              Add
            </button>
          </div>

          {webhooks.length > 0 && (
            <div className="space-y-2">
              {webhooks.map((wh) => (
                <div key={wh.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                  <code className="text-sm text-slate-700 truncate">{wh.url}</code>
                  <button
                    onClick={() => deleteWebhook(wh.id)}
                    className="text-red-500 text-sm hover:underline ml-4"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
