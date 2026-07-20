'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    loadInbox();
    loadMessages();
  }, []);

  async function loadInbox() {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/auth/login'; return; }
    try {
      const data = await api(`/api/inboxes/${params.id}`, { token });
      setInbox(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadMessages() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const data = await api(`/api/inboxes/${params.id}/messages`, { token });
      setMessages(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function viewMessage(messageId: string) {
    const token = localStorage.getItem('token');
    const data = await api(`/api/inboxes/${params.id}/messages/${messageId}`, { token: token! });
    setSelectedMessage(data);
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-900">
            &larr; Back to Inboxes
          </Link>
          {inbox && (
            <code className="bg-slate-100 px-3 py-1 rounded text-sm">{inbox.address}</code>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Messages ({messages.length})
            </h2>
            {messages.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <p className="text-slate-500">No messages yet. Send an email to this inbox.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => viewMessage(msg.id)}
                    className={`w-full text-left bg-white rounded-lg border p-4 hover:shadow-sm transition ${
                      selectedMessage?.id === msg.id ? 'border-brand-500' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-slate-900 text-sm truncate">
                        {msg.subject}
                      </div>
                      {msg.otp_code && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full ml-2">
                          OTP: {msg.otp_code}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      From: {msg.from_address} &middot; {new Date(msg.received_at).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {selectedMessage ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">{selectedMessage.subject}</h3>
                <div className="text-sm text-slate-500 mb-4">
                  From: {selectedMessage.from_address}<br />
                  Received: {new Date(selectedMessage.received_at).toLocaleString()}
                </div>
                {selectedMessage.otp_code && (
                  <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 mb-4">
                    <span className="text-sm text-brand-700 font-medium">
                      Extracted OTP: <code className="bg-white px-2 py-1 rounded">{selectedMessage.otp_code}</code>
                    </span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-4">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                    {selectedMessage.body_text || '(empty)'}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                Select a message to view its contents
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
