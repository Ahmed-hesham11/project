import { supabase } from "@/lib/supabase/client";

/**
 * API utility functions for testing image upload system
 * Use these to verify Supabase configuration
 */

export async function testSupabaseConnection() {
  console.log("🧪 TESTING SUPABASE CONNECTION...");

  try {
    const { data, error } = await supabase.from("courses").select("count").limit(1);

    if (error) {
      console.error("❌ Database connection failed:", error.message);
      return { connected: false, error: error.message };
    }

    console.log("✓ Database connection successful");
    return { connected: true };
  } catch (err) {
    console.error("❌ Connection test exception:", err);
    return { connected: false, error: String(err) };
  }
}

export async function testStorageBucket() {
  console.log("🧪 TESTING STORAGE BUCKET...");

  try {
    // List files in course-images bucket
    const { data, error } = await supabase.storage
      .from("course-images")
      .list("", { limit: 1 });

    if (error) {
      console.error("❌ Storage bucket access failed:", error.message);
      console.error("ERROR CODE:", error.message);

      if (
        error.message.includes("not found") ||
        error.message.includes("bucket")
      ) {
        console.error(
          "⚠️ Bucket 'course-images' not found. Create it in Supabase dashboard."
        );
      }

      if (error.message.includes("permission") || error.message.includes("policy")) {
        console.error(
          "⚠️ Permission denied. Ensure bucket is PUBLIC (RLS disabled)."
        );
      }

      return { accessible: false, error: error.message };
    }

    console.log("✓ Storage bucket accessible");
    console.log("Files in bucket:", data);
    return { accessible: true, fileCount: data?.length || 0 };
  } catch (err) {
    console.error("❌ Bucket test exception:", err);
    return { accessible: false, error: String(err) };
  }
}

export async function testPublicUrlGeneration() {
  console.log("🧪 TESTING PUBLIC URL GENERATION...");

  try {
    const testPath = "test-file.jpg";

    const { data } = supabase.storage
      .from("course-images")
      .getPublicUrl(testPath);

    if (!data || !data.publicUrl) {
      console.error("❌ Public URL generation failed - no URL returned");
      return { generated: false, error: "No URL returned" };
    }

    console.log("✓ Public URL generated");
    console.log("URL:", data.publicUrl);
    console.log("Starts with HTTPS:", data.publicUrl.startsWith("https://"));

    return {
      generated: true,
      url: data.publicUrl,
      isHttps: data.publicUrl.startsWith("https://"),
    };
  } catch (err) {
    console.error("❌ URL generation test exception:", err);
    return { generated: false, error: String(err) };
  }
}

export async function testCoursesTableSchema() {
  console.log("🧪 TESTING COURSES TABLE SCHEMA...");

  try {
    // Try to insert a test record (will fail on constraints, but shows schema)
    const { data, error } = await supabase
      .from("courses")
      .insert({
        title: "TEST_COURSE_DO_NOT_SAVE",
        image: "https://test.jpg",
        thumbnail_url: "https://test.jpg",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Expected: no rows returned
        console.log("✓ Courses table exists and is writable");
        return { schemaOk: true, hasImageField: true };
      }

      if (error.message.includes("image") || error.message.includes("thumbnail")) {
        console.error(
          "⚠️ Image/thumbnail field missing from courses table"
        );
        return {
          schemaOk: false,
          error: "Missing image or thumbnail_url field",
        };
      }

      console.error("❌ Schema test error:", error.message);
      return { schemaOk: false, error: error.message };
    }

    // If we get here, delete the test record
    if (data?.id) {
      await supabase.from("courses").delete().eq("id", data.id);
      console.log("✓ Test record deleted");
    }

    console.log("✓ Courses table schema is correct");
    return { schemaOk: true, hasImageField: true };
  } catch (err) {
    console.error("❌ Schema test exception:", err);
    return { schemaOk: false, error: String(err) };
  }
}

export async function runFullDiagnostics() {
  console.log(
    "%c=== RUNNING FULL IMAGE UPLOAD DIAGNOSTICS ===",
    "color: blue; font-size: 16px; font-weight: bold"
  );
  console.log("");

  const results = {
    connection: await testSupabaseConnection(),
    storage: await testStorageBucket(),
    url: await testPublicUrlGeneration(),
    schema: await testCoursesTableSchema(),
  };

  console.log("\n%c=== DIAGNOSTIC RESULTS ===", "color: blue; font-weight: bold");
  console.table(results);

  const allPass =
    results.connection.connected &&
    results.storage.accessible &&
    results.url.generated &&
    results.schema.schemaOk;

  if (allPass) {
    console.log("%c✓ ALL TESTS PASSED - System is ready!", "color: green; font-size: 14px; font-weight: bold");
  } else {
    console.log(
      "%c❌ SOME TESTS FAILED - Check errors above",
      "color: red; font-size: 14px; font-weight: bold"
    );
  }

  return results;
}

// USAGE:
// In browser console, run:
// import { runFullDiagnostics } from '/lib/api/imageUploadTest.ts'
// runFullDiagnostics()
