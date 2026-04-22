import { supabase } from "../supabase/client";
import { CourseApiItem } from "./types";
import { mapCourse } from "./mappers";
import { getSessionFromToken } from "./simpleAuth";

/**
 * Get user enrollments from Supabase
 */
export async function getMyEnrollments(token: string) {
  try {
    const session = await getSessionFromToken(token);

    console.log("[getMyEnrollments] Fetching enrollments for user:", session.id);

    // Fetch user enrollments
    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select("id, user_id, course_id")
      .eq("user_id", session.id);

    if (error) {
      console.error("[getMyEnrollments] Query error:", error);
      throw error;
    }

    console.log("[getMyEnrollments] Enrollments found:", enrollments?.length);

    if (!enrollments || enrollments.length === 0) {
      return [];
    }

    // Fetch course details for each enrollment
    const courseIds = enrollments.map((e) => e.course_id);
    const { data: coursesData, error: coursesError } = await supabase
      .from("courses")
      .select("*")
      .in("id", courseIds);

    if (coursesError) {
      console.error("[getMyEnrollments] Courses fetch error:", coursesError);
      throw coursesError;
    }

    console.log("[getMyEnrollments] Courses found:", coursesData?.length);
    console.log("[getMyEnrollments] Raw courses data:", coursesData);

    if (!coursesData || coursesData.length === 0) {
      console.warn("[getMyEnrollments] No courses found for IDs:", courseIds);
      return [];
    }

    return enrollments
      .map((enrollment) => {
        const courseData = coursesData.find((c) => c.id === enrollment.course_id);
        if (!courseData) {
          console.warn("[getMyEnrollments] Course not found for enrollment:", enrollment);
          return null;
        }
        return {
          id: enrollment.id,
          courseId: enrollment.course_id,
          course: mapCourse(courseData as unknown as CourseApiItem),
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error("[getMyEnrollments] Exception:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * TODO: Enroll user in course on Supabase
 */
export async function enrollInCourse(courseId: string, token: string) {
  try {
    const session = await getSessionFromToken(token);

    console.log("[enrollInCourse] Enrolling user:", {
      userId: session.id,
      courseId,
    });

    // Create enrollment record
    const { data, error } = await supabase.from("enrollments").insert({
      user_id: session.id,
      course_id: courseId,
      paid: false,
    }).select();

    if (error) {
      console.error("[enrollInCourse] Error:", error);
      throw error;
    }

    console.log("[enrollInCourse] Success:", data);
    return { message: "Enrolled successfully", data };
  } catch (error) {
    console.error("[enrollInCourse] Exception:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * TODO: Unenroll user from course on Supabase
 */
export async function unenrollInCourse(courseId: string, token: string) {
  try {
    const session = await getSessionFromToken(token);

    // TODO: Delete enrollment record
    const { error } = await supabase
      .from("enrollments")
      .delete()
      .eq("user_id", session.id)
      .eq("course_id", courseId);

    if (error) throw error;

    return { message: "Unenrolled successfully" };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}
