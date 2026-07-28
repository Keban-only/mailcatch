/**
 * BaseClient — базовий HTTP клієнт для всіх API взаємодій.
 * Інкапсулює логіку авторизації, заголовків, обробки помилок.
 * Всі API клієнти наслідують від нього.
 */

import { APIRequestContext } from '@playwright/test';

export interface RequestOptions {
  data?: Record<string, unknown>;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  status: number;
  body: T;
  headers: Record<string, string>;
}

export class BaseClient {
  constructor(
    protected request: APIRequestContext,
    protected baseUrl: string
  ) {}

  protected async get<T = any>(path: string, opts?: RequestOptions): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, opts?.params);
    const res = await this.request.get(url, {
      headers: opts?.headers,
      timeout: opts?.timeout,
    });
    return {
      status: res.status(),
      body: await res.json().catch(() => null),
      headers: res.headers(),
    };
  }

  protected async post<T = any>(path: string, opts?: RequestOptions): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, opts?.params);
    const res = await this.request.post(url, {
      data: opts?.data,
      headers: opts?.headers,
    });
    return {
      status: res.status(),
      body: await res.json().catch(() => null),
      headers: res.headers(),
    };
  }

  protected async delete<T = any>(path: string, opts?: RequestOptions): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, opts?.params);
    const res = await this.request.delete(url, {
      headers: opts?.headers,
    });
    return {
      status: res.status(),
      body: await res.json().catch(() => null),
      headers: res.headers(),
    };
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    return url.toString();
  }
}
