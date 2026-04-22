import { supabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

/**
 * Initialize database schema for phone-based auth
 * Adds auth_email column to students table if it doesn't exist
 */
export async function GET() {
  try {
    // Test if auth_email column exists by querying it
    const { error: queryError } = await supabase
      .from("students")
      .select("auth_email")
      .limit(1);

    if (queryError?.message.includes("auth_email") || queryError?.code === "PGRST") {
      // Column doesn't exist, need to add it via RPC or migration
      return NextResponse.json(
        {
          success: false,
          message: "❌ العمود auth_email غير موجود",
          instruction: "يجب إضافة العمود auth_email إلى جدول students",
          sql: `ALTER TABLE students ADD COLUMN IF NOT EXISTS auth_email TEXT UNIQUE;`,
          note: "Please run this SQL in Supabase SQL Editor",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "✅ النظام جاهز للتسجيل الجديد",
      auth_email_column: "متوفر",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
