import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * Forgot password endpoint
 * Returns the password for the given phone number
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentPhone } = body;

    if (!studentPhone) {
      return NextResponse.json(
        { success: false, error: "رقم الهاتف مطلوب" },
        { status: 400 }
      );
    }

    // Find user by phone
    const { data, error } = await supabase
      .from("users")
      .select("password_hash, first_name, email")
      .eq("student_phone", studentPhone)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "رقم الهاتف غير مسجل" },
        { status: 404 }
      );
    }

    // Return password
    return NextResponse.json({
      success: true,
      message: "تم استرجاع الباسورد بنجاح",
      data: {
        studentName: data.first_name,
        email: data.email,
        password: data.password_hash,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "خطأ في الخادم",
      },
      { status: 500 }
    );
  }
}
