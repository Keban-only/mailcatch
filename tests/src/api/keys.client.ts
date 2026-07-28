/**
 * KeysClient — управління API ключами.
 * Авторизація через JWT (Bearer token), не API Key.
 */

import { APIRequestContext } from '@playwright/test';
import { BaseClient, ApiResponse } from './base.client';

export interface ApiKey {
  id: string;
  name: string;
  key?: string;
  key_preview: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export class KeysClient extends BaseClient {
  private token: string;

  constructor(request: APIRequestContext, baseUrl: string, token: string) {
    super(request, baseUrl);
    this.token = token;
  }

  private get authHeaders() {
    return { Authorization: `Bearer ${this.token}` };
  }

  async list(): Promise<ApiResponse<{ data: ApiKey[] }>> {
    return this.get('/api/keys', { headers: this.authHeaders });
  }

  async create(name: string): Promise<ApiResponse<ApiKey>> {
    return this.post<ApiKey>('/api/keys', {
      data: { name },
      headers: this.authHeaders,
    });
  }

  async revoke(id: string): Promise<ApiResponse<{ revoked: boolean }>> {
    return this.delete(`/api/keys/${id}`, { headers: this.authHeaders });
  }
}
