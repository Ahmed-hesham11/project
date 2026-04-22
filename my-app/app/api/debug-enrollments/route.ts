import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * Debug endpoint to check enrollments and courses
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

    // Check enrollments
    const { data: enrollments, error: enrollError } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", userId);

    console.log("Enrollments query:", { enrollments, enrollError });

    // Check if courses table exists and has data
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("id, title")
      .limit(5);

    console.log("Courses query:", { courses, coursesError });

    // Check all tables
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");

    console.log("Tables:", { tables, tablesError });

    return NextResponse.json({
      success: true,
      debug: {
        enrollmentsFound: enrollments?.length || 0,
        enrollments,
        enrollError: enrollError?.message,
        coursesFound: courses?.length || 0,
        courses,
        coursesError: coursesError?.message,
        tables: tables?.map((t: any) => t.table_name),
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
