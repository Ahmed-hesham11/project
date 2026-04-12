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
import { formatCurrency } from "@/lib/utils";
import { Course } from "@/types/course";

type CourseLevel = Course["level"];

interface CourseDraft {
  title: string;
  description: string;
  price: string;
  isFree: boolean;
  level: CourseLevel;
  image: string;
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
  const [draft, setDraft] = useState<CourseDraft | null>(null);

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
    setDraft({
      title: course.title,
      description: course.tagline,
      price: String(course.price),
      isFree: course.price <= 0,
      level: course.level,
      image: course.image,
    });
  }

  function openCreateModal() {
    setIsCreateModalOpen(true);
    setEditingCourseId(null);
    setDraft({
      title: "",
      description: "",
      price: "",
      isFree: false,
      level: "Beginner",
      image: "/images/logo.jpg",
    });
  }

  function closeEditor() {
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

  function handleUploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    updateDraft("image", localUrl);
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
    if (!draft.isFree && (!draft.price || Number(draft.price) < 0)) {
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
    const levelMap = {
      Beginner: "BEGINNER",
      Intermediate: "INTERMEDIATE",
      Advanced: "ADVANCED",
    } as const;

    setIsSaving(true);
    setError(null);

    try {
      if (editingCourseId) {
      await updateAdminCourse(
        editingCourseId,
        {
          title: draft.title.trim(),
          tagline: draft.description.trim(),
          price: draft.isFree ? 0 : Number.isFinite(parsedPrice) ? parsedPrice : undefined,
          level: levelMap[draft.level],
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
                price: draft.isFree ? 0 : Number.isFinite(parsedPrice) ? parsedPrice : course.price,
                level: draft.level,
                image: draft.image || course.image,
              }
            : course,
        ),
      );
    } else {
      const mentorId = managedCourses[0]?.mentorId;

      if (!mentorId) {
        setError("Cannot create course because no mentor reference is available yet.");
        return;
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
          price: draft.isFree ? 0 : Number(parsedPrice || 0),
          image: draft.image || "/images/logo.jpg",
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
          tags: (response.course.tags ?? []).map((item) => item.name),
          modules: [],
          reviews: [],
          featured: response.course.featured,
        },
        ...currentCourses,
      ]);
    }

      closeEditor();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save course");
    } finally {
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
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete course");
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
      {loading ? <p className="text-slate-300">Loading courses...</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Courses</h2>
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

            <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
              <span>Is Free</span>
              <button
                type="button"
                onClick={() => updateDraft("isFree", !draft.isFree)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                  draft.isFree ? "bg-emerald-500" : "bg-slate-500"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                    draft.isFree ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </label>

            <Input
              label="Price"
              type="number"
              min="0"
              value={draft.price}
              disabled={draft.isFree}
              onChange={(event) => updateDraft("price", event.target.value)}
            />

            <label className="grid gap-2 text-sm text-slate-300">
              <span className="font-medium text-white">Upload image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
                className="rounded-xl border border-white/10 bg-white/5 p-2"
              />
            </label>

            <label className="grid gap-2 text-sm text-slate-300">
              <span className="font-medium text-white">Grade</span>
              <select
                value={draft.level}
                onChange={(event) =>
                  updateDraft("level", event.target.value as CourseLevel)
                }
                className="h-12 rounded-2xl border border-white/10 bg-white/6 px-4 text-white outline-none transition focus:border-[var(--primary)]"
              >
                <option value="Beginner">1st Secondary</option>
                <option value="Intermediate">2nd Secondary</option>
                <option value="Advanced">3rd Secondary</option>
              </select>
            </label>

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                className="border-white/10 bg-white/6 text-slate-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
                onClick={closeEditor}
              >
                Cancel
              </Button>
              <Button onClick={saveCourseEdits} disabled={isSaving}>
                {isSaving ? "Saving..." : editingCourse ? "Save" : "Create Course"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  );
}
