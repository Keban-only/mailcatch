const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function api(path: string, options: FetchOptions = {}) {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      headers,
    });
  } catch (err) {
    throw new Error('Network error — check your connection');
  }

  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/api/auth')) {
      localStorage.clear();
      window.location.href = '/auth/login';
      throw new Error('Session expired');
    }
    if (res.status === 429) {
      throw new Error('Too many requests — wait a moment and try again');
    }
    if (res.status === 403) {
      throw new Error('Access denied');
    }
    if (res.status >= 500) {
      throw new Error('Server error — try again later');
    }
    const error = await res.json().catch(() => ({ error: `Request failed (${res.status})` }));
    throw new Error(error.error || `Request failed (${res.status})`);
  }

  return res.json();
}
