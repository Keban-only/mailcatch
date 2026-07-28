/**
 * AuthClient — робота з авторизацією (login, register).
 * Повертає JWT токен для подальших запитів.
 */

import { APIRequestContext } from '@playwright/test';
import { BaseClient, ApiResponse } from './base.client';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    plan: string;
    role: string;
  };
}

export class AuthClient extends BaseClient {
  constructor(request: APIRequestContext, baseUrl: string) {
    super(request, baseUrl);
  }

  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.post<LoginResponse>('/api/auth/login', {
      data: { email, password },
    });
  }

  async register(email: string, password: string, name?: string): Promise<ApiResponse<any>> {
    return this.post('/api/auth/register', {
      data: { email, password, name },
    });
  }

  async me(token: string): Promise<ApiResponse<any>> {
    return this.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
