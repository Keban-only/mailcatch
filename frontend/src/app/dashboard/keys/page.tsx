'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

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

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/auth/login'; return; }
    const data = await api('/api/keys', { token });
    setKeys(data.data);
  }

  async function createKey() {
    const token = localStorage.getItem('token');
    const data = await api('/api/keys', {
      method: 'POST',
      token: token!,
      body: JSON.stringify({ name: newKeyName || 'API Key' }),
    });
    setNewKey(data.key);
    setShowCreate(false);
    setNewKeyName('');
    loadKeys();
  }

  async function revokeKey(id: string) {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;
    const token = localStorage.getItem('token');
    await api(`/api/keys/${id}`, { method: 'DELETE', token: token! });
    loadKeys();
  }

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
            <Link href="/dashboard/keys" className="text-brand-600 font-medium">API Keys</Link>
            <Link href="/dashboard/settings" className="text-slate-600 hover:text-slate-900">Settings</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
            <p className="text-slate-600">Manage your API keys for programmatic access</p>
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
                onClick={() => { navigator.clipboard.writeText(newKey); }}
                className="bg-green-600 text-white px-3 py-2 rounded text-sm"
              >
                Copy
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
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button onClick={createKey} className="bg-brand-600 text-white px-4 py-2 rounded-lg">
                Create
              </button>
              <button onClick={() => setShowCreate(false)} className="text-slate-500 px-4 py-2">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Name</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Key</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Created</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Last Used</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-b border-slate-100">
                  <td className="px-6 py-4 font-medium text-slate-900">{key.name}</td>
                  <td className="px-6 py-4">
                    <code className="text-sm text-slate-500">{key.key_preview}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(key.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {key.is_active ? (
                      <button
                        onClick={() => revokeKey(key.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Revoke
                      </button>
                    ) : (
                      <span className="text-slate-400 text-sm">Revoked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
