'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    features: ['100 emails/month', '1 API key', '24h message retention', 'No webhooks'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9/mo',
    features: ['5,000 emails/month', '5 API keys', '7 day retention', 'Webhooks', 'Priority support'],
  },
  {
    id: 'team',
    name: 'Team',
    price: '$29/mo',
    features: ['50,000 emails/month', 'Unlimited API keys', '30 day retention', 'Webhooks', 'Dedicated support'],
  },
];

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/auth/login'; return; }
    const u = JSON.parse(stored);
    setUser(u);
    setEditName(u.name || '');
    setEditEmail(u.email || '');
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
      if (!err.message?.includes('403')) {
        setError(err.message || 'Failed to load webhooks');
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    setSaving(true);
    try {
      const body: any = {};
      if (editName !== (user.name || '')) body.name = editName;
      if (editEmail !== user.email) body.email = editEmail;
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      if (editEmail !== user.email && !newPassword) {
        body.currentPassword = currentPassword;
      }

      if (Object.keys(body).length === 0) {
        setError('No changes to save');
        setSaving(false);
        return;
      }

      const updated = await api('/api/auth/profile', {
        method: 'PATCH',
        token,
        body: JSON.stringify(body),
      });

      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
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

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <p className="text-sm text-green-700">{success}</p>
            <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <hr className="border-slate-200" />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required for email or password change"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave empty to keep current"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            {newPassword && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            )}

            <button
              onClick={saveProfile}
              disabled={saving}
              className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Plan & Pricing Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Plan & Pricing</h2>
          <p className="text-sm text-slate-600 mb-6">
            You&apos;re currently on the <span className="font-semibold capitalize">{user.plan}</span> plan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-xl border-2 p-5 ${
                  user.plan === plan.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                  {user.plan === plan.id && (
                    <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full">Current</span>
                  )}
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-4">{plan.price}</p>
                <ul className="space-y-2 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-slate-600 flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                {user.plan === plan.id ? (
                  <div className="text-center text-sm text-slate-500">Active</div>
                ) : plan.id === 'free' && user.plan !== 'free' ? (
                  <a
                    href={`mailto:support@mailcatch.dev?subject=Downgrade to Free&body=Hi, I'd like to downgrade my account (${user.email}) to the Free plan.`}
                    className="block text-center border border-slate-300 text-slate-700 text-sm py-2 rounded-lg hover:bg-slate-100 transition"
                  >
                    Downgrade to Free
                  </a>
                ) : plan.id !== 'free' ? (
                  <a
                    href={`mailto:support@mailcatch.dev?subject=Upgrade to ${plan.name}&body=Hi, I'd like to upgrade my account (${user.email}) to the ${plan.name} plan.`}
                    className="block text-center bg-slate-900 text-white text-sm py-2 rounded-lg hover:bg-slate-800 transition"
                  >
                    Upgrade to {plan.name}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Webhooks Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Webhooks</h2>
          <p className="text-sm text-slate-600 mb-4">
            Get notified when an email arrives at any of your inboxes.
          </p>

          {user.plan === 'free' ? (
            <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
              Webhooks are available on Pro and Team plans.{' '}
              <a href="mailto:support@mailcatch.dev?subject=Upgrade inquiry" className="text-brand-600 hover:underline">
                Upgrade to unlock
              </a>
            </div>
          ) : (
            <>
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
            </>
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
