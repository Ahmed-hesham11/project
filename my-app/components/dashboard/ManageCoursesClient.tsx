"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { AdminLayout } from "@/components/dashboard/AdminLayout";
import { CourseFilterBar } from "@/components/dashboard/CourseFilterBar";
import { CourseTable } from "@/components/dashboard/CourseTable";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { CourseStatusMap, PriceFilter, SortOption } from "@/components/dashboard/course-dashboard.types";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { createAdminCourse, deleteAdminCourse, getAdminCourses, updateAdminCourse } from "@/lib/api/admin";
import { supabase } from "@/lib/supabase/client";
import { Course } from "@/types/course";

type CourseLevel = Course["level"];

interface CourseDraft {
  title: string;
  description: string;
  price: string;
  level: CourseLevel;
  image: string;
}

function getUiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const message = [record.message, record.error, record.details, record.hint].find(
      (value) => typeof value === "string" && value.trim(),
    );

    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}

function getStorageUploadErrorMessage(error: unknown): string {
  const message = getUiErrorMessage(error, "Failed to upload image");
  const normalized = message.toLowerCase();

  if (normalized.includes("row-level security") || normalized.includes("policy")) {
    return "Storage policy error: add INSERT and SELECT policies for bucket course-images in storage.objects.";
  }

  return message;
}

export function ManageCoursesClient() {
  const { token, user } = useAuth();
  const [managedCourses, setManagedCourses] = useState<Course[]>([]);
  const [courseStatus, setCourseStatus] = useState<CourseStatusMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [levelFilter, setLevelFilter] = useState<"all" | CourseLevel>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [draft, setDraft] = useState<CourseDraft | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState("");

  useEffect(() => {
    if (!token) return;
    if (user?.role === "ADMIN" && !user.adminProfile?.canManageCourses) {
      setError("ليس لديك صلاحية إدارة الكورسات. اطلب من السوبر أدمن تفعيل صلاحية Manage Courses.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const courses = await getAdminCourses(token);
        setManagedCourses(courses);
        setCourseStatus(
          Object.fromEntries(courses.map((course) => [course.id, true])),
        );
      } catch (fetchError) {
        setError(
          fetchError instanceof Error && fetchError.message.includes("Missing admin permission")
            ? "ليس لديك صلاحية إدارة الكورسات."
            : fetchError instanceof Error
              ? fetchError.message
              : "Failed to load courses",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [token, user]);

  const editingCourse = useMemo(
    () => managedCourses.find((course) => course.id === editingCourseId) ?? null,
    [editingCourseId, managedCourses],
  );

  function openEditor(course: Course) {
    setEditingCourseId(course.id);
    setSelectedImageFile(null);
    setSelectedImagePreview(course.image || "");
    setDraft({
      title: course.title,
      description: course.tagline,
      price: String(course.price),
      level: course.level,
      image: course.image,
    });
  }

  function openCreateModal() {
    setIsCreateModalOpen(true);
    setEditingCourseId(null);
    setSelectedImageFile(null);
    setSelectedImagePreview("");
    setDraft({
      title: "",
      description: "",
      price: "",
      level: "Beginner",
      image: "",
    });
  }

  function closeEditor() {
    if (selectedImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(selectedImagePreview);
    }
    setSelectedImageFile(null);
    setSelectedImagePreview("");
    setEditingCourseId(null);
    setIsCreateModalOpen(false);
    setDraft(null);
  }

  function updateDraft<Key extends keyof CourseDraft>(key: Key, value: CourseDraft[Key]) {
    setDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            [key]: value,
          }
        : currentDraft,
    );
  }

  async function handleUploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    console.log("[ManageCoursesClient] FILE:", file);

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    if (selectedImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(selectedImagePreview);
    }

    setSelectedImageFile(file);
    setSelectedImagePreview(URL.createObjectURL(file));
    setError(null);
    event.target.value = "";
  }

  async function uploadImageToStorage(file: File) {
    console.log("[ManageCoursesClient] FILE:", file);

    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `course-${Date.now()}.${extension}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("course-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    console.log("[ManageCoursesClient] UPLOAD RESULT:", uploadData, uploadError);

    if (uploadError) {
      throw new Error(getStorageUploadErrorMessage(uploadError));
    }

    const { data: publicUrlData } = supabase.storage
      .from("course-images")
      .getPublicUrl(uploadData?.path ?? fileName);

    const publicUrl = publicUrlData.publicUrl;
    console.log("[ManageCoursesClient] IMAGE URL:", publicUrl);

    if (!publicUrl) {
      throw new Error("Failed to get public image URL");
    }

    return publicUrl;
  }

  function normalizeSlug(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function validateDraft() {
    if (!draft) return "Invalid form";
    if (!draft.title.trim()) return "Title is required";
    if (!draft.description.trim()) return "Description is required";
    if (!editingCourseId && !selectedImageFile && !draft.image.trim()) return "Image is required";
    if (!draft.price || Number(draft.price) < 0) {
      return "Price must be zero or more";
    }
    return null;
  }

  async function saveCourseEdits() {
    if (!draft || !token) {
      return;
    }

    const validationError = validateDraft();
    if (validationError) {
      setError(validationError);
      return;
    }

    const parsedPrice = Number(draft.price);
    const effectivePrice = Number.isFinite(parsedPrice) ? parsedPrice : 0;
    const levelMap = {
      Beginner: "BEGINNER",
      Intermediate: "INTERMEDIATE",
      Advanced: "ADVANCED",
    } as const;

    setIsSaving(true);
    setError(null);

    try {
      let imageUrl = draft.image.trim();

      if (selectedImageFile) {
        setIsUploadingImage(true);
        imageUrl = await uploadImageToStorage(selectedImageFile);
      }

      if (editingCourseId) {
      await updateAdminCourse(
        editingCourseId,
        {
          title: draft.title.trim(),
          tagline: draft.description.trim(),
          description: draft.description.trim(),
          price: effectivePrice,
          level: levelMap[draft.level],
          image: selectedImageFile ? imageUrl : undefined,
        },
        token,
      );

      setManagedCourses((currentCourses) =>
        currentCourses.map((course) =>
          course.id === editingCourseId
            ? {
                ...course,
                title: draft.title.trim() || course.title,
                tagline: draft.description.trim() || course.tagline,
                description: draft.description.trim() || course.description,
                price: effectivePrice,
                level: draft.level,
                image: selectedImageFile ? imageUrl : course.image,
              }
            : course,
        ),
      );
    } else {
      const mentorId = user?.id ?? managedCourses[0]?.mentorId ?? "";

      if (!mentorId) {
        throw new Error("Unable to determine creator user id for this course");
      }

      const slug = normalizeSlug(draft.title) || `course-${Date.now()}`;

      const response = await createAdminCourse(
        {
          slug,
          title: draft.title.trim(),
          tagline: draft.description.trim(),
          description: draft.description.trim(),
          category: "General",
          level: levelMap[draft.level],
          duration: "0h",
          lessonsCount: 0,
          students: 0,
          rating: 0,
          price: effectivePrice,
          image: imageUrl,
          featured: false,
          mentorId,
        },
        token,
      );

      setManagedCourses((currentCourses) => [
        {
          id: response.course.id,
          slug: response.course.slug,
          title: response.course.title,
          tagline: response.course.tagline,
          description: response.course.description,
          category: response.course.category,
          level: draft.level,
          duration: response.course.duration,
          lessonsCount: response.course.lessonsCount,
          students: response.course.students,
          rating: response.course.rating,
          price: Number(response.course.price),
          image: response.course.image,
          mentorId: response.course.mentorId,
          tags: response.course.tags ?? [],
          modules: [],
          reviews: [],
          featured: response.course.featured,
        },
        ...currentCourses,
      ]);
    }

      closeEditor();
    } catch (saveError) {
      setError(getUiErrorMessage(saveError, "Failed to save course"));
    } finally {
      setIsUploadingImage(false);
      setIsSaving(false);
    }
  }

  async function handleDeleteCourse(course: Course) {
    if (!token) return;
    const shouldDelete = window.confirm(`Delete ${course.title}?`);
    if (!shouldDelete) return;

    try {
      await deleteAdminCourse(course.id, token);
      setManagedCourses((currentCourses) =>
        currentCourses.filter((item) => item.id !== course.id),
      );
    } catch (deleteError) {
      setError(getUiErrorMessage(deleteError, "Failed to delete course"));
    }
  }

  function toggleCourseStatus(courseId: string) {
    setCourseStatus((currentStatus) => ({
      ...currentStatus,
      [courseId]: !currentStatus[courseId],
    }));
  }

  const visibleCourses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    let result = managedCourses.filter((course) => {
      if (priceFilter === "free" && course.price > 0) return false;
      if (priceFilter === "paid" && course.price <= 0) return false;
      if (levelFilter !== "all" && course.level !== levelFilter) return false;
      if (!normalizedSearch) return true;
      return [course.title, course.category, course.tagline].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );
    });

    if (sortBy === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [managedCourses, levelFilter, priceFilter, search, sortBy]);

  return (
    <AdminLayout
      title="Courses Dashboard"
      description="Manage your content with a modern, fast SaaS-style workflow."
    >
      <DashboardTopbar
        search={search}
        onSearchChange={setSearch}
        userName={user?.profile?.firstName ?? user?.email ?? "Admin User"}
        userRole={user?.role ?? "ADMIN"}
      />

      {error ? (
        <ErrorState title="Courses failed to load" description={error} />
      ) : null}
      {loading ? <p className="text-[var(--text-secondary)]">Loading courses...</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-[var(--text-main)]">Courses</h2>
        <Button onClick={openCreateModal}>+ Add Course</Button>
      </div>

      <CourseFilterBar
        search={search}
        onSearchChange={setSearch}
        priceFilter={priceFilter}
        onPriceFilterChange={setPriceFilter}
        levelFilter={levelFilter}
        onLevelFilterChange={setLevelFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      <CourseTable
        courses={visibleCourses}
        courseStatus={courseStatus}
        onToggleStatus={toggleCourseStatus}
        onEdit={openEditor}
        onDelete={handleDeleteCourse}
      />

      <Modal
        open={Boolean((editingCourse || isCreateModalOpen) && draft)}
        title={editingCourse ? `Edit ${editingCourse.title}` : "Create course"}
        description="Create or update course details from one place."
        onClose={closeEditor}
      >
        {draft ? (
          <div className="space-y-5">
            <Input
              label="Course title"
              value={draft.title}
              onChange={(event) => updateDraft("title", event.target.value)}
            />
            <Input
              label="Description"
              value={draft.description}
              onChange={(event) => updateDraft("description", event.target.value)}
            />

            <Input
              label="Price"
              type="number"
              min="0"
              value={draft.price}
              onChange={(event) => updateDraft("price", event.target.value)}
            />

            <label className="grid gap-2 text-sm text-[var(--text-secondary)]">
              <span className="font-medium text-[var(--text-main)]">Upload image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
                disabled={isUploadingImage}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-2"
              />
              <span className="text-xs text-[var(--text-secondary)]">
                {isUploadingImage
                  ? "Uploading image..."
                  : selectedImageFile
                    ? "Image selected. It will upload when you click Create Course."
                    : draft.image
                      ? "Current image will be used"
                    : "Please upload an image"}
              </span>
            </label>

            {(selectedImagePreview || draft.image) && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
                <p className="mb-2 text-xs text-[var(--text-secondary)]">Image preview</p>
                <img
                  src={selectedImagePreview || draft.image}
                  alt="Course preview"
                  className="h-24 w-24 rounded-lg object-cover"
                />
              </div>
            )}

            <label className="grid gap-2 text-sm text-[var(--text-secondary)]">
              <span className="font-medium text-[var(--text-main)]">Grade</span>
              <select
                value={draft.level}
                onChange={(event) =>
                  updateDraft("level", event.target.value as CourseLevel)
                }
                className="h-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 text-[var(--text-main)] outline-none transition focus:border-[var(--primary)]"
              >
                <option value="Beginner">1st Secondary</option>
                <option value="Intermediate">2nd Secondary</option>
                <option value="Advanced">3rd Secondary</option>
              </select>
            </label>

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                className="border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]"
                onClick={closeEditor}
              >
                Cancel
              </Button>
              <Button onClick={saveCourseEdits} disabled={isSaving || isUploadingImage}>
                {isSaving || isUploadingImage ? "Saving..." : editingCourse ? "Save" : "Create Course"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  );
}
