export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
  cache?: RequestCache;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...(options.headers ?? {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: options.cache ?? "no-store",
    });
  } catch {
    throw new ApiError(
      503,
      `Cannot connect to backend at ${API_BASE_URL}. Make sure the backend server is running.`,
    );
  }

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
    errors?: Array<{ path?: string; message?: string }>;
  };

  if (!response.ok) {
    const detailedError = payload.errors?.[0]?.message;
    throw new ApiError(response.status, detailedError ?? payload.message ?? "Request failed");
  }

  return payload as T;
}
