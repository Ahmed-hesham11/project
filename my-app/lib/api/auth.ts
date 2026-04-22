import { supabase } from "../supabase/client";
import { AuthResponse, AuthUser } from "./types";

export interface RegisterPayload {
  firstName: string;
  secondName: string;
  thirdName: string;
  lastName: string;
  studentPhone: string;
  fatherPhone: string;
  motherPhone?: string;
  governorate: string;
  educationType: string;
  grade: string;
  department: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  studentPhone: string;
  password: string;
}

/**
 * Generate unique email from phone number
 * Ensures each phone gets a unique email even with rate limiting
 */
function generateUniqueEmail(studentPhone: string, timestamp: number): string {
  return `${studentPhone}-${timestamp}@student.local`;
}

/**
 * Phone-based authentication with Supabase
 * Uses phone number as primary identifier
 */
export async function login(payload: LoginPayload) {
  try {
    // First, find the student by phone number to get their auth email
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("auth_email")
      .eq("student_phone", payload.studentPhone)
      .single();

    if (studentError || !studentData) {
      throw new Error("رقم الهاتف أو كلمة المرور غير صحيحة");
    }

    // Sign in using the stored auth email
    const { data, error } = await supabase.auth.signInWithPassword({
      email: studentData.auth_email,
      password: payload.password,
    });

    if (error) throw new Error("رقم الهاتف أو كلمة المرور غير صحيحة");

    const user = await getMe(data.session?.access_token || "");
    return {
      user,
      accessToken: data.session?.access_token,
    } as AuthResponse;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Phone-based registration with unique email generation
 * Stores student profile with phone as unique identifier
 */
export async function register(payload: RegisterPayload) {
  try {
    if (payload.password !== payload.confirmPassword) {
      throw new Error("كلمات المرور غير متطابقة");
    }

    // Generate unique email with timestamp to avoid rate limiting
    const uniqueEmail = generateUniqueEmail(
      payload.studentPhone,
      Date.now()
    );

    // Create Supabase auth user with unique email
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: uniqueEmail,
      password: payload.password,
    });

    if (authError) {
      throw new Error(
        authError.message || "فشل إنشاء الحساب. يرجى المحاولة لاحقاً"
      );
    }

    // Store full student profile in students table with auth_email
    if (authData.user) {
      const { error: profileError } = await supabase.from("students").insert({
        auth_id: authData.user.id,
        auth_email: uniqueEmail,
        student_phone: payload.studentPhone,
        father_phone: payload.fatherPhone,
        mother_phone: payload.motherPhone || null,
        first_name: payload.firstName,
        second_name: payload.secondName,
        third_name: payload.thirdName,
        last_name: payload.lastName,
        email: payload.email,
        governorate: payload.governorate,
        education_type: payload.educationType,
        grade: payload.grade,
        department: payload.department,
      });

      if (profileError) {
        throw new Error(
          profileError.message || "فشل حفظ بيانات الطالب"
        );
      }
    }

    const user = await getMe(authData.session?.access_token || "");
    return {
      user,
      accessToken: authData.session?.access_token,
    } as AuthResponse;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * TODO: Get current user from Supabase session
 */
export async function getMe(token: string): Promise<AuthUser> {
  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) throw error;

    // TODO: Fetch full student profile from students table
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("auth_id", data.user?.id)
      .single();

    if (studentError) throw studentError;

    return {
      id: data.user?.id || "",
      studentPhone: studentData?.student_phone || "",
      // TODO: Map other fields from studentData
      role: "USER",
    } as AuthUser;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * TODO: Update user profile in Supabase
 */
export async function updateMe(
  payload: { firstName?: string; lastName?: string },
  token: string,
): Promise<AuthUser> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser(
      token
    );

    if (authError) throw authError;

    // TODO: Update student profile in students table
    const { data: updated, error: updateError } = await supabase
      .from("students")
      .update({
        first_name: payload.firstName,
        last_name: payload.lastName,
      })
      .eq("auth_id", authData.user?.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      id: authData.user?.id || "",
      studentPhone: updated?.student_phone || "",
      role: "USER",
    } as AuthUser;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

