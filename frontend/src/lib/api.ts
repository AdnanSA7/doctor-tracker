const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

let memoryToken: string | null = null;

export function setAuthToken(token: string | null) {
  memoryToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('dt_token', token);
    } else {
      sessionStorage.removeItem('dt_token');
    }
  }
}

export function getAuthToken(): string | null {
  if (memoryToken) return memoryToken;
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('dt_token');
  }
  return null;
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...init } = options;
  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = getAuthToken();
  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...init.headers,
    },
    credentials: 'include',
  });

  if (res.status === 401) {
    setAuthToken(null);
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
  }

  const json = await res.json();

  if (!res.ok || !json.success) {
    const errorMsg = json.error?.message || 'An API error occurred';
    const err: any = new Error(errorMsg);
    err.status = res.status;
    err.code = json.error?.code;
    err.details = json.error?.details;
    throw err;
  }

  return json.data;
}

export async function apiFetchWithMeta<T>(endpoint: string, options: FetchOptions = {}): Promise<{ data: T; meta: any }> {
  const { params, ...init } = options;
  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = getAuthToken();
  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...init.headers,
    },
    credentials: 'include',
  });

  if (res.status === 401) {
    setAuthToken(null);
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
  }

  const json = await res.json();

  if (!res.ok || !json.success) {
    const errorMsg = json.error?.message || 'An API error occurred';
    const err: any = new Error(errorMsg);
    err.status = res.status;
    err.code = json.error?.code;
    err.details = json.error?.details;
    throw err;
  }

  return { data: json.data, meta: json.meta };
}
