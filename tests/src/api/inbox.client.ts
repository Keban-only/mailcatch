/**
 * InboxClient — CRUD операції з інбоксами.
 * Авторизація через API Key (X-API-Key header).
 */

import { APIRequestContext } from '@playwright/test';
import { BaseClient, ApiResponse } from './base.client';

export interface Inbox {
  id: string;
  address: string;
  name: string | null;
  is_active: boolean;
  message_count: number;
  created_at: string;
  expires_at: string;
}

export interface InboxListResponse {
  data: Inbox[];
  pagination: { page: number; limit: number; total: number };
  usage: { used: number; limit: number; plan: string };
}

export class InboxClient extends BaseClient {
  private apiKey: string;

  constructor(request: APIRequestContext, baseUrl: string, apiKey: string) {
    super(request, baseUrl);
    this.apiKey = apiKey;
  }

  private get authHeaders() {
    return { 'X-API-Key': this.apiKey };
  }

  async create(name?: string): Promise<ApiResponse<Inbox>> {
    return this.post<Inbox>('/api/inboxes', {
      data: { name: name || undefined },
      headers: this.authHeaders,
    });
  }

  async list(page = 1, limit = 20): Promise<ApiResponse<InboxListResponse>> {
    return this.get<InboxListResponse>('/api/inboxes', {
      params: { page: String(page), limit: String(limit) },
      headers: this.authHeaders,
    });
  }

  async getById(id: string): Promise<ApiResponse<Inbox>> {
    return this.get<Inbox>(`/api/inboxes/${id}`, {
      headers: this.authHeaders,
    });
  }

  async remove(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.delete(`/api/inboxes/${id}`, {
      headers: this.authHeaders,
    });
  }
}
