import { supabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // اختبار الاتصال بقاعدة البيانات
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .limit(1);

    if (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          details: error 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "✅ الاتصال بقاعدة البيانات نجح!",
      data: data,
      timestamp: new Date().toISOString(),
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
