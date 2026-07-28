'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
      setError(null);
      const data = await api('/api/webhooks', { token });
      setWebhooks(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  }

  async function addWebhook() {
    if (!newWebhookUrl.trim()) return;
    try {
      new URL(newWebhookUrl);
    } catch {
      setError('Please enter a valid URL (https://...)');
      return;
    }
    setAdding(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      await api('/api/webhooks', {
        method: 'POST',
        token: token!,
        body: JSON.stringify({ url: newWebhookUrl }),
      });
      setNewWebhookUrl('');
      await loadWebhooks();
    } catch (err: any) {
      setError(err.message || 'Failed to add webhook');
    } finally {
      setAdding(false);
    }
  }

  async function deleteWebhook() {
    if (!deleteId) return;
    const token = localStorage.getItem('token');
    try {
      await api(`/api/webhooks/${deleteId}`, { method: 'DELETE', token: token! });
      setDeleteId(null);
      await loadWebhooks();
    } catch (err: any) {
      setError(err.message || 'Failed to remove webhook');
      setDeleteId(null);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

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
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  user.plan === 'team'
                    ? 'bg-purple-100 text-purple-700'
                    : user.plan === 'pro'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                }`}>
                  {user.plan === 'free' ? 'Free' : user.plan === 'pro' ? 'Pro' : 'Team'}
                </span>
                {user.plan === 'free' && (
                  <span className="text-sm text-slate-500">
                    Want more? <a href="mailto:support@mailcatch.dev" className="text-brand-600 hover:underline">Contact us to upgrade</a>
                  </span>
                )}
              </div>
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
              onKeyDown={(e) => e.key === 'Enter' && addWebhook()}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              onClick={addWebhook}
              disabled={adding || !newWebhookUrl.trim()}
              className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 transition"
            >
              {adding ? 'Adding...' : 'Add'}
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading webhooks...</p>
          ) : webhooks.length > 0 ? (
            <div className="space-y-2">
              {webhooks.map((wh) => (
                <div key={wh.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                  <code className="text-sm text-slate-700 truncate">{wh.url}</code>
                  <button
                    onClick={() => setDeleteId(wh.id)}
                    className="text-red-500 text-sm hover:underline ml-4"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No webhooks configured</p>
          )}
        </div>
      </main>

      <ConfirmModal
        open={!!deleteId}
        title="Remove webhook"
        message="Are you sure you want to remove this webhook? You will stop receiving notifications."
        confirmLabel="Remove"
        danger
        onConfirm={deleteWebhook}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
