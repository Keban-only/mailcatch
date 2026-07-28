/**
 * MessageClient — робота з повідомленнями інбоксу.
 * Включає long polling через /wait ендпоінт.
 */

import { APIRequestContext } from '@playwright/test';
import { BaseClient, ApiResponse } from './base.client';

export interface Message {
  id: string;
  from_address: string;
  subject: string;
  otp_code: string | null;
  received_at: string;
}

export interface FullMessage extends Message {
  body_text: string | null;
  body_html: string | null;
}

export class MessageClient extends BaseClient {
  private apiKey: string;

  constructor(request: APIRequestContext, baseUrl: string, apiKey: string) {
    super(request, baseUrl);
    this.apiKey = apiKey;
  }

  private get authHeaders() {
    return { 'X-API-Key': this.apiKey };
  }

  async list(inboxId: string): Promise<ApiResponse<{ data: Message[] }>> {
    return this.get(`/api/inboxes/${inboxId}/messages`, {
      headers: this.authHeaders,
    });
  }

  async getById(inboxId: string, messageId: string): Promise<ApiResponse<FullMessage>> {
    return this.get<FullMessage>(`/api/inboxes/${inboxId}/messages/${messageId}`, {
      headers: this.authHeaders,
    });
  }

  async waitForMessage(inboxId: string, opts?: { timeout?: number; since?: string }): Promise<ApiResponse<Message>> {
    const timeout = opts?.timeout || 15;
    const since = opts?.since || new Date(0).toISOString();
    return this.get<Message>(`/api/inboxes/${inboxId}/wait`, {
      params: { timeout: String(timeout), since },
      headers: this.authHeaders,
      timeout: (timeout + 5) * 1000,
    });
  }
}
