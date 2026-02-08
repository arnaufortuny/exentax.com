import { QueryClient, QueryFunction } from "@tanstack/react-query";

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
      // Not JSON, use raw text
    }
    throw new Error(message);
  }
}

const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5000;

let csrfToken: string | null = null;

export async function getCsrfToken(forceRefresh = false): Promise<string> {
  if (csrfToken && !forceRefresh) return csrfToken;
  csrfToken = null;
  try {
    const res = await fetch('/api/csrf-token', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      csrfToken = data.csrfToken;
      return csrfToken || '';
    }
  } catch {
    // Silently fail
  }
  return '';
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
  
  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
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
      } else if (body.message && body.message.includes('CSRF')) {
        csrfToken = null;
        const newToken = await getCsrfToken(true);
        if (newToken) {
          const retryHeaders: Record<string, string> = {};
          if (data) retryHeaders["Content-Type"] = "application/json";
          retryHeaders["X-CSRF-Token"] = newToken;
          const retryRes = await fetch(url, {
            method,
            headers: retryHeaders,
            body: data ? JSON.stringify(data) : undefined,
            credentials: "include",
          });
          if (!retryRes.ok) {
            await throwIfResNotOk(retryRes);
          }
          return retryRes;
        }
      }
    } catch {}
    csrfToken = null;
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
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

function retryDelayFn(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 10000);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: 3,
      retryDelay: retryDelayFn,
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 2,
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
