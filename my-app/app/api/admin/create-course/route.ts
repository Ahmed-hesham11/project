import { NextRequest, NextResponse } from "next/server";

import { getSessionFromToken } from "@/lib/api/simpleAuth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

interface CreateCourseBody {
  title?: string;
  description?: string;
  category?: string;
  price?: number;
  image?: string;
  featured?: boolean;
  mentorId?: string;
}

function mapUiCategoryToDb(category: string | null | undefined): number {
  const normalized = (category ?? "").trim().toLowerCase();

  if (normalized.includes("advanced")) {
    return 2;
  }

  if (normalized.includes("practice")) {
    return 3;
  }

  return 1;
}

function isUuid(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeRole(role: string | undefined) {
  return role?.trim().toLowerCase().replace(/[\s-]+/g, "_") ?? "student";
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const session = await getSessionFromToken(token);
    const role = normalizeRole(session.role);

    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ error: "Missing admin permission" }, { status: 403 });
    }

    const body = (await request.json()) as CreateCourseBody;

    const title = body.title?.trim() || "";
    const description = body.description?.trim() || "";
    const category = body.category || "General";
    const price = Number(body.price ?? 0);
    const image = (body.image || "").trim();
    const featured = Boolean(body.featured);
    const creatorId = (body.mentorId || session.id || "").trim();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    if (!image || image.startsWith("blob:")) {
      return NextResponse.json({ error: "A valid uploaded image URL is required" }, { status: 400 });
    }

    if (!isUuid(creatorId)) {
      return NextResponse.json({ error: "Invalid creator user id" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseServiceClient();

    const insertPayload: Record<string, unknown> = {
      title,
      description,
      category: mapUiCategoryToDb(category),
      price,
      thumbnail_url: image,
      created_by: creatorId,
      is_published: featured,
    };

    const { data, error } = await supabaseAdmin
      .from("courses")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error || !data) {
      const errorMessage = error?.message || "Failed to create course";
      const isRlsError = errorMessage.toLowerCase().includes("row-level security");

      return NextResponse.json(
        {
          error: isRlsError
            ? "Course creation blocked by RLS. Configure a real SUPABASE_SERVICE_ROLE_KEY in .env.local and restart the dev server."
            : errorMessage,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error while creating course",
      },
      { status: 500 },
    );
  }
}
