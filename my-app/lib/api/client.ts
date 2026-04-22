/**
 * TODO: DEPRECATED - Old backend has been removed
 * 
 * The Express backend at http://localhost:5000 has been deprecated.
 * All API calls should now use the Supabase client directly.
 * 
 * Migration Status:
 * ✅ auth.ts - Using Supabase
 * ✅ courses.ts - Using Supabase
 * ✅ enrollments.ts - Using Supabase
 * ✅ lms.ts - Using Supabase
 * ✅ admin.ts - Using Supabase
 * 
 * Next Steps:
 * 1. Set up Supabase database schema matching the old Prisma schema
 * 2. Enable RLS (Row Level Security) for admin and user roles
 * 3. Test all Supabase queries
 * 4. Remove this file once fully migrated
 */

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

/**
 * @deprecated Use Supabase client directly instead
 * This function only exists for backward compatibility
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  console.warn(
    `[DEPRECATED] apiRequest('${path}') is deprecated. Use Supabase client instead.`
  );

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
      `Cannot connect to backend at ${API_BASE_URL}. The backend has been migrated to Supabase. Use Supabase client instead.`,
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
