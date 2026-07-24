'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Message {
  id: string;
  from_address: string;
  subject: string;
  otp_code: string | null;
  body_text?: string;
  body_html?: string;
  received_at: string;
}

interface Inbox {
  id: string;
  address: string;
  message_count: number;
  created_at: string;
}

export default function InboxDetailPage() {
  const params = useParams();
  const [inbox, setInbox] = useState<Inbox | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'text' | 'html'>('html');
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevCountRef = useRef(0);

  const loadMessages = useCallback(async (silent = false) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      if (!silent) setError(null);
      const data = await api(`/api/inboxes/${params.id}/messages`, { token });
      const newMessages: Message[] = data.data || [];
      if (newMessages.length !== prevCountRef.current) {
        setMessages(newMessages);
        prevCountRef.current = newMessages.length;
      }
    } catch (err: any) {
      if (!silent) setError(err.message || 'Failed to load messages');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/auth/login'; return; }

    async function init() {
      try {
        const data = await api(`/api/inboxes/${params.id}`, { token: token! });
        setInbox(data);
      } catch (err: any) {
        setError(err.message || 'Inbox not found');
      }
      await loadMessages();
    }
    init();

    pollRef.current = setInterval(() => loadMessages(true), 10000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [params.id, loadMessages]);

  async function viewMessage(messageId: string) {
    const token = localStorage.getItem('token');
    try {
      const data = await api(`/api/inboxes/${params.id}/messages/${messageId}`, { token: token! });
      setSelectedMessage(data);
      setViewMode(data.body_html ? 'html' : 'text');
    } catch (err: any) {
      setError(err.message || 'Failed to load message');
    }
  }

  function copyOtp(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 text-sm">
              &larr; Inboxes
            </Link>
            {inbox && (
              <code className="bg-slate-100 px-3 py-1 rounded text-sm font-mono">{inbox.address}</code>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500">Live</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-[360px_1fr] gap-6 h-[calc(100vh-130px)]">
          {/* Messages list */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-slate-700">
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </h2>
            </div>

            {messages.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center flex-1 flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">Waiting for emails...</p>
                <p className="text-xs text-slate-400 mt-1">Send an email to this address — it will appear here automatically</p>
              </div>
            ) : (
              <div className="space-y-1 overflow-y-auto flex-1">
                {messages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => viewMessage(msg.id)}
                    className={`w-full text-left rounded-lg border p-3 transition ${
                      selectedMessage?.id === msg.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-medium text-slate-900 text-sm truncate flex-1">
                        {msg.subject || '(No subject)'}
                      </p>
                      {msg.otp_code && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-mono shrink-0">
                          {msg.otp_code}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-slate-500 truncate">{msg.from_address}</p>
                      <p className="text-xs text-slate-400 shrink-0 ml-2">{timeAgo(msg.received_at)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message detail */}
          <div className="min-h-0 flex flex-col">
            {selectedMessage ? (
              <div className="bg-white rounded-xl border border-slate-200 flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* Message header */}
                <div className="p-4 border-b border-slate-100 shrink-0">
                  <h3 className="font-semibold text-slate-900 text-lg">
                    {selectedMessage.subject || '(No subject)'}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span>From: <span className="text-slate-700">{selectedMessage.from_address}</span></span>
                    <span>{new Date(selectedMessage.received_at).toLocaleString()}</span>
                  </div>
                </div>

                {/* OTP badge */}
                {selectedMessage.otp_code && (
                  <div className="px-4 py-3 bg-green-50 border-b border-green-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-sm font-medium text-green-700">OTP detected:</span>
                      <code className="bg-white px-3 py-1 rounded border border-green-200 font-mono font-bold text-green-800">
                        {selectedMessage.otp_code}
                      </code>
                    </div>
                    <button
                      onClick={() => copyOtp(selectedMessage.otp_code!)}
                      className={`text-sm px-3 py-1 rounded transition ${
                        copied ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}

                {/* View mode tabs */}
                {selectedMessage.body_html && selectedMessage.body_text && (
                  <div className="px-4 py-2 border-b border-slate-100 flex gap-1 shrink-0">
                    <button
                      onClick={() => setViewMode('html')}
                      className={`px-3 py-1 text-xs font-medium rounded transition ${
                        viewMode === 'html' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      HTML
                    </button>
                    <button
                      onClick={() => setViewMode('text')}
                      className={`px-3 py-1 text-xs font-medium rounded transition ${
                        viewMode === 'text' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Plain Text
                    </button>
                  </div>
                )}

                {/* Message body */}
                <div className="flex-1 overflow-y-auto p-4">
                  {viewMode === 'html' && selectedMessage.body_html ? (
                    <iframe
                      srcDoc={`<base target="_blank">${selectedMessage.body_html}`}
                      className="w-full h-full border-0 min-h-[400px]"
                      sandbox="allow-same-origin allow-popups"
                      title="Email content"
                    />
                  ) : (
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                      {selectedMessage.body_text || '(empty)'}
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 flex-1 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-slate-400">Select a message to read</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
