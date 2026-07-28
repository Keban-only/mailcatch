'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface ApiKey {
  id: string;
  name: string;
  key_preview: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/auth/login'; return; }
    try {
      setError(null);
      const data = await api('/api/keys', { token });
      setKeys(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    setCreating(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const data = await api('/api/keys', {
        method: 'POST',
        token: token!,
        body: JSON.stringify({ name: newKeyName || 'API Key' }),
      });
      setNewKey(data.key);
      setShowCreate(false);
      setNewKeyName('');
      await loadKeys();
    } catch (err: any) {
      setError(err.message || 'Failed to create key');
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey() {
    if (!revokeId) return;
    setRevoking(true);
    try {
      const token = localStorage.getItem('token');
      await api(`/api/keys/${revokeId}`, { method: 'DELETE', token: token! });
      setRevokeId(null);
      await loadKeys();
    } catch (err: any) {
      setError(err.message || 'Failed to revoke key');
      setRevokeId(null);
    } finally {
      setRevoking(false);
    }
  }

  function copyKey() {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your API keys for programmatic access
              {keys.length > 0 && (
                <span className="ml-2 text-slate-400">
                  ({keys.filter(k => k.is_active).length} active / {keys.length} total)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition font-medium"
          >
            + New Key
          </button>
        </div>

        {newKey && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-800 font-medium mb-2">New API key created. Copy it now — it won&apos;t be shown again.</p>
            <div className="flex items-center gap-2">
              <code className="bg-white px-3 py-2 rounded border text-sm flex-1 font-mono">{newKey}</code>
              <button
                onClick={copyKey}
                className={`px-3 py-2 rounded text-sm font-medium transition ${
                  copied ? 'bg-green-700 text-white' : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {showCreate && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h3 className="font-medium text-slate-900 mb-4">Create new API key</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Key name (e.g. CI/CD)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createKey()}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                onClick={createKey}
                disabled={creating}
                className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 transition"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button onClick={() => { setShowCreate(false); setNewKeyName(''); }} className="text-slate-500 px-4 py-2 hover:text-slate-700">
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500">Loading...</p>
          </div>
        ) : keys.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No API keys yet</h3>
            <p className="text-slate-500 mb-6">Create an API key to access MailCatch programmatically</p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition font-medium"
            >
              Create First Key
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Key</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Created</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Last Used</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {keys.map((key) => (
                  <tr key={key.id} className={`transition ${key.is_active ? 'hover:bg-slate-50' : 'opacity-50 bg-slate-50'}`}>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${key.is_active ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                        {key.name}
                      </span>
                      {!key.is_active && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                          Revoked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <code className={`text-sm px-2 py-1 rounded ${key.is_active ? 'text-slate-500 bg-slate-100' : 'text-slate-400 bg-slate-50 line-through'}`}>
                        {key.key_preview}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">
                      {new Date(key.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">
                      {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {key.is_active ? (
                        key.name === 'Default' ? (
                          <span className="text-xs text-slate-400">Protected</span>
                        ) : (
                          <button
                            onClick={() => setRevokeId(key.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Revoke
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-slate-400">Disabled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <ConfirmModal
        open={!!revokeId}
        title="Revoke API key"
        message="This action cannot be undone. Any applications using this key will lose access immediately."
        confirmLabel="Revoke"
        danger
        loading={revoking}
        onConfirm={revokeKey}
        onCancel={() => setRevokeId(null)}
      />
    </div>
  );
}
