'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface Inbox {
  id: string;
  address: string;
  name: string | null;
  message_count: number;
  created_at: string;
}

interface Usage {
  used: number;
  limit: number;
  plan: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

const PER_PAGE = 20;

export default function DashboardPage() {
  const [inboxes, setInboxes] = useState<Inbox[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadInboxes = useCallback(async (targetPage: number) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const data = await api(`/api/inboxes?page=${targetPage}&limit=${PER_PAGE}`, { token: token! });
      const items = data.data || [];
      const pag = data.pagination;

      if (items.length === 0 && targetPage > 1) {
        const lastPage = Math.max(1, Math.ceil(pag.total / PER_PAGE));
        setPage(lastPage);
        return;
      }

      setInboxes(items);
      if (data.usage) setUsage(data.usage);
      if (pag) setPagination(pag);
    } catch (err: any) {
      setError(err.message || 'Failed to load inboxes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      window.location.href = '/auth/login';
      return;
    }
    loadInboxes(page);
  }, [page, loadInboxes]);

  async function createInbox() {
    if (creating) return;
    if (usage && usage.used >= usage.limit) {
      setShowLimitModal(true);
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await api('/api/inboxes', { method: 'POST', token: token! });
      setPage(1);
      await loadInboxes(1);
    } catch (err: any) {
      if (err.message?.includes('limit')) {
        setShowLimitModal(true);
      } else {
        setError(err.message || 'Failed to create inbox');
      }
    } finally {
      setCreating(false);
    }
  }

  async function deleteSelected() {
    if (selected.size === 0 || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        Array.from(selected).map((id) =>
          api(`/api/inboxes/${id}`, { method: 'DELETE', token: token! })
        )
      );
      setSelected(new Set());
      setShowDeleteModal(false);
      await loadInboxes(page);
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === inboxes.length && inboxes.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(inboxes.map((i) => i.id)));
    }
  }

  function changePage(newPage: number) {
    setSelected(new Set());
    setPage(newPage);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  }

  const totalPages = pagination ? Math.ceil(pagination.total / PER_PAGE) : 1;
  const showingFrom = pagination ? (page - 1) * PER_PAGE + 1 : 0;
  const showingTo = pagination ? Math.min(page * PER_PAGE, pagination.total) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error banner */}
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

        {/* Usage counter */}
        {usage && (
          <div className="mb-6 bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Inboxes created this month</p>
                <p className="text-lg font-semibold text-slate-900">
                  {usage.used} <span className="text-slate-400 font-normal">/ {usage.limit.toLocaleString()}</span>
                </p>
              </div>
              <div className="w-48 hidden sm:block">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usage.used / usage.limit > 0.9 ? 'bg-red-500' :
                      usage.used / usage.limit > 0.7 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header + actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Inboxes</h1>
            <p className="text-sm text-slate-500 mt-1">
              {pagination && pagination.total > 0
                ? `${pagination.total} inbox${pagination.total > 1 ? 'es' : ''} total`
                : 'Create your first inbox to start receiving test emails'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
              >
                Delete ({selected.size})
              </button>
            )}
            <button
              onClick={async () => { setRefreshing(true); await loadInboxes(page); setRefreshing(false); }}
              disabled={refreshing}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
              title="Refresh"
            >
              <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={createInbox}
              disabled={creating}
              className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition font-medium disabled:opacity-50"
            >
              {creating ? 'Creating...' : '+ New Inbox'}
            </button>
          </div>
        </div>

        {/* Empty state */}
        {(!pagination || pagination.total === 0) ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No inboxes yet</h3>
            <p className="text-slate-500 mb-6">Create an inbox and start receiving test emails in seconds</p>
            <button
              onClick={createInbox}
              disabled={creating}
              className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition font-medium disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create First Inbox'}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="w-10 pl-4 pr-2 py-3">
                    <input
                      type="checkbox"
                      checked={inboxes.length > 0 && selected.size === inboxes.length}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Address</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Messages</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Created</th>
                  <th className="w-20 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inboxes.map((inbox) => (
                  <tr
                    key={inbox.id}
                    className={`hover:bg-slate-50 transition ${selected.has(inbox.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="w-10 pl-4 pr-2 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(inbox.id)}
                        onChange={() => toggleSelect(inbox.id)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono">{inbox.address}</code>
                        <button
                          onClick={() => copyToClipboard(inbox.address)}
                          className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                          title="Copy address"
                        >
                          {copied === inbox.address ? (
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="text-center px-4 py-3 text-sm text-slate-600 hidden sm:table-cell">
                      {inbox.message_count}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">
                      {new Date(inbox.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/inbox/${inbox.id}`}
                        className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {showingFrom}–{showingTo} of {pagination!.total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changePage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-600 min-w-[80px] text-center">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => changePage(page + 1)}
                    disabled={page >= totalPages}
                    className="px-3 py-1 text-sm rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <ConfirmModal
        open={showDeleteModal}
        title="Delete inboxes"
        message={`Are you sure you want to delete ${selected.size} inbox${selected.size > 1 ? 'es' : ''}? All messages will be permanently removed.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={deleteSelected}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Limit reached modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowLimitModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Monthly limit reached</h3>
              <p className="text-sm text-slate-600 mb-2">
                You've used all <strong>{usage?.limit}</strong> inboxes for this month on the <strong className="capitalize">{usage?.plan}</strong> plan.
              </p>
              <p className="text-xs text-slate-400 mb-6">
                Your limit resets automatically at the start of each billing cycle.
              </p>
              {usage?.plan !== 'team' && (
                <a
                  href="mailto:support@mailcatch.dev?subject=Plan upgrade"
                  className="block w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition mb-3 text-center"
                >
                  {usage?.plan === 'free' ? 'Upgrade to Pro — 5,000/mo' : 'Upgrade to Team — 50,000/mo'}
                </a>
              )}
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full py-2 text-sm text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
