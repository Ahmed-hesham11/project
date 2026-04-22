import { supabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get all users
    const { data: users, error } = await supabase
      .from("users")
      .select("id, student_phone, first_name, fourth_name, password_hash");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
