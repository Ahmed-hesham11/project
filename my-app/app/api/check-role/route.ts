import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * Check current user role
 * Useful for debugging authentication issues
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId مطلوب" },
        { status: 400 }
      );
    }

    // Fetch user data from Supabase
    const { data, error } = await supabase
      .from("users")
      .select("id, student_phone, first_name, fourth_name, role")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: data.id,
        name: `${data.first_name} ${data.fourth_name}`,
        phone: data.student_phone,
        role: data.role,
        isAdmin: data.role === "admin" || data.role === "super_admin",
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
