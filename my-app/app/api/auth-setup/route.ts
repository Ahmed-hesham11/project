import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * API route to initialize simple auth system
 * Adds password_hash column to students table if it doesn't exist
 */
export async function GET() {
  try {
    // Test if password_hash column exists
    const { data, error } = await supabase
      .from("users")
      .select("password_hash")
      .limit(1);

    if (error?.message.includes("password_hash")) {
      return NextResponse.json(
        {
          success: false,
          status: "needs_setup",
          message: "❌ النظام يحتاج إلى إعداد",
          instruction: "يجب إضافة العمود password_hash إلى جدول students",
          sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';`,
          note: "Run this SQL in Supabase SQL Editor",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: "ready",
      message: "✅ النظام جاهز للتسجيل البسيط",
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
