import { QueryClient, QueryFunction, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import i18n from "@/lib/i18n";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    let message = text;
    try {
      const json = JSON.parse(text);
      if (json.message) {
        message = json.message;
      }
    } catch {
    }
    throw new ApiError(message, res.status);
  }
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch'))) {
    return true;
  }
  const msg = (error as Error)?.message?.toLowerCase() || '';
  return msg.includes('network') || msg.includes('failed to fetch') || msg.includes('load failed');
}

function isNonRetryableStatus(error: unknown): boolean {
  if (error instanceof ApiError) {
    return [401, 403, 404].includes(error.status);
  }
  return false;
}

const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5000;

let csrfToken: string | null = null;

const AUTH_TOKEN_KEY = "exentax_auth_token";

export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuthToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
  }
}

function addAuthHeader(headers: Record<string, string>) {
  const token = getStoredAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
}

export async function getCsrfToken(forceRefresh = false): Promise<string> {
  if (getStoredAuthToken()) return '';
  if (csrfToken && !forceRefresh) return csrfToken;
  csrfToken = null;
  try {
    const res = await fetch('/api/csrf-token', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      csrfToken = data.csrfToken;
      return csrfToken || '';
    }
    console.warn('[CSRF] Failed to fetch token, status:', res.status);
  } catch (err) {
    console.warn('[CSRF] Token fetch error:', err);
  }
  return '';
}

export async function refreshCsrfToken(): Promise<string> {
  return getCsrfToken(true);
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const cacheKey = `${method}:${url}`;
  
  if (method === 'GET') {
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return new Response(JSON.stringify(cached.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  const headers: Record<string, string> = {};
  if (data) headers["Content-Type"] = "application/json";
  
  addAuthHeader(headers);

  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS' && !headers["Authorization"]) {
    const token = await getCsrfToken();
    if (token) headers["X-CSRF-Token"] = token;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (res.status === 403) {
    try {
      const cloned = res.clone();
      const body = await cloned.json();
      if (body.code === 'ACCOUNT_UNDER_REVIEW' || body.code === 'ACCOUNT_DEACTIVATED') {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      } else if (body.code === 'CSRF_INVALID' && !headers["Authorization"]) {
        csrfToken = null;
        const newToken = await getCsrfToken(true);
        if (newToken) {
          const retryHeaders: Record<string, string> = {};
          if (data) retryHeaders["Content-Type"] = "application/json";
          retryHeaders["X-CSRF-Token"] = newToken;
          addAuthHeader(retryHeaders);
          const retryRes = await fetch(url, {
            method,
            headers: retryHeaders,
            body: data ? JSON.stringify(data) : undefined,
            credentials: "include",
          });
          await throwIfResNotOk(retryRes);
          return retryRes;
        }
      }
    } catch (retryErr) {
      throw retryErr;
    }
    csrfToken = null;
  }

  if (res.status === 403) {
    try {
      const body = await res.clone().json();
      if (body.code === 'CSRF_INVALID') {
        throw new Error("Session expired. Please reload the page.");
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('Session expired')) throw e;
    }
  }

  await throwIfResNotOk(res);
  
  if (method !== 'GET') {
    requestCache.clear();
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    addAuthHeader(headers);

    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

function retryDelayFn(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 30000);
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (isNetworkError(error)) {
        toast({
          title: i18n.t('toast.connectionError'),
          description: i18n.t('errors.networkError'),
          variant: 'destructive',
        });
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (isNetworkError(error)) {
        toast({
          title: i18n.t('toast.connectionError'),
          description: i18n.t('errors.networkError'),
          variant: 'destructive',
        });
      }
    },
  }),
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: (failureCount, error) => {
        if (isNonRetryableStatus(error)) return false;
        return failureCount < 3;
      },
      retryDelay: retryDelayFn,
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: (failureCount, error) => {
        if (isNonRetryableStatus(error)) return false;
        const msg = (error as Error)?.message?.toLowerCase() || '';
        if (msg.includes('csrf') || msg.includes('authenticated') || msg.includes('session') || msg.includes('expired')) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: retryDelayFn,
      networkMode: 'offlineFirst',
    },
  },
});

export function prefetchQueries(keys: string[]) {
  keys.forEach(key => {
    queryClient.prefetchQuery({
      queryKey: [key],
      staleTime: 1000 * 60 * 2,
    });
  });
}
