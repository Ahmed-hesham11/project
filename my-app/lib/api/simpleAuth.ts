import { supabase } from "@/lib/supabase/client";

export interface SimpleLoginPayload {
  studentPhone: string;
  password: string;
}

export interface SimpleRegisterPayload {
  firstName: string;
  secondName: string;
  thirdName: string;
  fourthName: string;
  studentPhone: string;
  parentPhone: string;
  email: string;
  governorate: string;
  educationType: string;
  grade: string;
  specialization: string;
  password: string;
}

export interface AuthSession {
  id: string;
  studentPhone: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
  adminProfile?: {
    canManageCourses?: boolean;
    canManageUsers?: boolean;
    canManageContent?: boolean;
    canManagePayments?: boolean;
  } | null;
}

function normalizeRole(rawRole: unknown): string {
  if (typeof rawRole !== "string") {
    return "student";
  }

  const normalized = rawRole.trim().toLowerCase().replace(/[\s-]+/g, "_");

  if (normalized === "admin") {
    return "admin";
  }

  if (normalized === "super_admin" || normalized === "superadmin") {
    return "super_admin";
  }

  return "student";
}

function getUserRole(data: Record<string, unknown>): string {
  return normalizeRole(data.rule ?? data.role);
}

/**
 * Store password as plain text (not hashed)
 * Note: This is less secure but allows password recovery
 */
function storePassword(password: string): string {
  return password; // Plain text storage
}

function verifyPassword(password: string, stored: string): boolean {
  return password === stored;
}

/**
 * Simple Login - Phone + Password only
 */
export async function simpleLogin(payload: SimpleLoginPayload) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("student_phone", payload.studentPhone)
      .single();

    if (error || !data) {
      throw new Error("رقم الهاتف أو كلمة المرور غير صحيحة");
    }

    // Verify password
    if (!verifyPassword(payload.password, data.password_hash)) {
      throw new Error("رقم الهاتف أو كلمة المرور غير صحيحة");
    }

    return {
      session: {
        id: data.id,
        studentPhone: data.student_phone,
        firstName: data.first_name,
        lastName: data.fourth_name,
        email: data.email ?? undefined,
        role: getUserRole(data),
        profile: {
          firstName: data.first_name ?? undefined,
          lastName: data.fourth_name ?? undefined,
        },
      },
      accessToken: btoa(`${data.id}:${Date.now()}`), // Simple token
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error("خطأ في تسجيل الدخول");
  }
}

/**
 * Simple Register - No verification
 */
export async function simpleRegister(payload: SimpleRegisterPayload) {
  try {
    // Check if phone already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("student_phone", payload.studentPhone)
      .single();

    if (existing) {
      throw new Error("هذا الرقم مسجل مسبقاً");
    }

    // Hash password
    const passwordHash = storePassword(payload.password);

    // Insert student record
    const { data, error } = await supabase
      .from("users")
      .insert({
        student_phone: payload.studentPhone,
        parent_phone: payload.parentPhone,
        first_name: payload.firstName,
        second_name: payload.secondName,
        third_name: payload.thirdName,
        fourth_name: payload.fourthName,
        email: payload.email,
        governorate: payload.governorate,
        education_type: payload.educationType,
        grade: payload.grade,
        specialization: payload.specialization,
        password_hash: passwordHash,
        role: "student",
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message || "فشل التسجيل");
    }

    return {
      session: {
        id: data.id,
        studentPhone: data.student_phone,
        firstName: data.first_name,
        lastName: data.fourth_name,
        email: data.email ?? undefined,
        role: getUserRole(data),
        profile: {
          firstName: data.first_name ?? undefined,
          lastName: data.fourth_name ?? undefined,
        },
      },
      accessToken: btoa(`${data.id}:${Date.now()}`),
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error("خطأ في التسجيل");
  }
}

/**
 * Get user from token
 */
export async function getSessionFromToken(token: string) {
  try {
    const [userId] = atob(token).split(":");
    
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      throw new Error("جلسة غير صحيحة");
    }

    return {
      id: data.id,
      studentPhone: data.student_phone,
      firstName: data.first_name,
      lastName: data.fourth_name,
      email: data.email ?? undefined,
      role: getUserRole(data),
      profile: {
        firstName: data.first_name ?? undefined,
        lastName: data.fourth_name ?? undefined,
      },
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error("خطأ في التحقق");
  }
}
