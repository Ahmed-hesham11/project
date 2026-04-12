"use client";

import { useState } from "react";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  AdminLayout,
} from "@/components/dashboard/AdminLayout";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Modal } from "@/components/ui/Modal";
import { createStudentByAdmin, getAdminStudentsWithSearch, updateStudentEnrollments } from "@/lib/api/admin";
import { getCourses } from "@/lib/api/courses";
import { Course } from "@/types/course";

interface AdminStudent {
  id: string;
  name: string;
  email: string;
  completionRate: number;
  enrolledCourseIds: string[];
}

export function ManageStudentsClient() {
  const { token, user } = useAuth();
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newStudentMessage, setNewStudentMessage] = useState("");
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentForm, setStudentForm] = useState({
    firstName: "",
    secondName: "",
    thirdName: "",
    lastName: "",
    studentPhone: "",
    fatherPhone: "",
    motherPhone: "",
    governorate: "القاهرة",
    educationType: "حكومي",
    grade: "الصف الثالث الثانوي",
    department: "علمي علوم",
    email: "",
    password: "Password123!",
  });

  useEffect(() => {
    if (!token) return;
    if (user?.role === "ADMIN" && !user.adminProfile?.canManageUsers) {
      setError("ليس لديك صلاحية إدارة الطلاب. اطلب من السوبر أدمن تفعيل صلاحية Manage Users.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const [studentsResponse, coursesResponse] = await Promise.all([
          getAdminStudentsWithSearch(search, token),
          getCourses(),
        ]);
        setStudents(studentsResponse);
        setCourses(coursesResponse);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error && fetchError.message.includes("Missing admin permission")
            ? "ليس لديك صلاحية إدارة الطلاب."
            : fetchError instanceof Error
              ? fetchError.message
              : "Failed to load students",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [token, user, search]);

  async function onCreateStudent() {
    if (!token) return;
    setNewStudentMessage("");
    try {
      const response = await createStudentByAdmin(studentForm, token);
      setNewStudentMessage(`تم إنشاء الطالب بنجاح. ID: ${response.student.id}`);
      const studentsResponse = await getAdminStudentsWithSearch(search, token);
      setStudents(studentsResponse);
    } catch (createError) {
      setNewStudentMessage(createError instanceof Error ? createError.message : "فشل إنشاء الطالب");
    }
  }

  const editingStudent =
    students.find((student) => student.id === editingStudentId) ?? null;

  async function toggleStudentCourse(studentId: string, courseId: string) {
    const targetStudent = students.find((student) => student.id === studentId);
    if (!targetStudent || !token) return;

    const isEnrolled = targetStudent.enrolledCourseIds.includes(courseId);
    const nextCourseIds = isEnrolled
      ? targetStudent.enrolledCourseIds.filter((id) => id !== courseId)
      : [...targetStudent.enrolledCourseIds, courseId];

    await updateStudentEnrollments(studentId, nextCourseIds, token);
    setStudents((currentStudents) =>
      currentStudents.map((student) =>
        student.id === studentId
          ? { ...student, enrolledCourseIds: nextCourseIds }
          : student,
      ),
    );
  }

  return (
    <AdminLayout
      title="Manage Students"
      description="See every student, check their courses, and edit their subscriptions."
    >
      {error ? (
        <ErrorState title="Students failed to load" description={error} />
      ) : null}
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ابحث باسم الطالب أو الإيميل أو ID"
          className="h-11 rounded-xl bg-white/10 px-3 text-white md:col-span-2"
        />
        <Button onClick={() => setSearch((value) => value.trim())}>Search</Button>
      </div>
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-2">
        <input className="h-10 rounded bg-white/10 px-3 text-white" placeholder="First name" value={studentForm.firstName} onChange={(e) => setStudentForm((p) => ({ ...p, firstName: e.target.value }))} />
        <input className="h-10 rounded bg-white/10 px-3 text-white" placeholder="Second name" value={studentForm.secondName} onChange={(e) => setStudentForm((p) => ({ ...p, secondName: e.target.value }))} />
        <input className="h-10 rounded bg-white/10 px-3 text-white" placeholder="Third name" value={studentForm.thirdName} onChange={(e) => setStudentForm((p) => ({ ...p, thirdName: e.target.value }))} />
        <input className="h-10 rounded bg-white/10 px-3 text-white" placeholder="Last name" value={studentForm.lastName} onChange={(e) => setStudentForm((p) => ({ ...p, lastName: e.target.value }))} />
        <input className="h-10 rounded bg-white/10 px-3 text-white" placeholder="Student phone" value={studentForm.studentPhone} onChange={(e) => setStudentForm((p) => ({ ...p, studentPhone: e.target.value }))} />
        <input className="h-10 rounded bg-white/10 px-3 text-white" placeholder="Father phone" value={studentForm.fatherPhone} onChange={(e) => setStudentForm((p) => ({ ...p, fatherPhone: e.target.value }))} />
        <input className="h-10 rounded bg-white/10 px-3 text-white" placeholder="Mother phone (optional)" value={studentForm.motherPhone} onChange={(e) => setStudentForm((p) => ({ ...p, motherPhone: e.target.value }))} />
        <input className="h-10 rounded bg-white/10 px-3 text-white" placeholder="Email" value={studentForm.email} onChange={(e) => setStudentForm((p) => ({ ...p, email: e.target.value }))} />
        <input className="h-10 rounded bg-white/10 px-3 text-white" placeholder="Password" type="password" value={studentForm.password} onChange={(e) => setStudentForm((p) => ({ ...p, password: e.target.value }))} />
        <Button onClick={onCreateStudent}>إضافة طالب يدوي</Button>
        {newStudentMessage ? <p className="md:col-span-2 text-sm text-sky-200">{newStudentMessage}</p> : null}
      </div>
      {loading ? <p className="text-slate-300">Loading students...</p> : null}
      <div className="space-y-4">
        {students.map((student, index) => {
          return (
            <div
              key={student.id}
              className="dashboard-card rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(30,41,59,0.84))] p-7 shadow-[0_24px_48px_-30px_rgba(2,8,23,0.82)]"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xl font-semibold text-white">
                      {student.name}
                    </p>
                  </div>
                  <p className="text-sm text-slate-400">
                    {student.email}
                  </p>
                    <p className="text-xs text-slate-500">
                      ID: {student.id}
                    </p>
                </div>

                <div className="flex flex-col gap-3 xl:items-end">
                  <div className="grid gap-2 text-sm text-slate-400">
                    <p>{student.enrolledCourseIds.length} enrolled courses</p>
                    <p>{student.completionRate}% completion</p>
                  </div>
                  <Button
                    variant="secondary"
                    className="border-white/10 bg-white/6 text-sky-200 hover:border-sky-300/30 hover:bg-sky-400/10 hover:text-white"
                    onClick={() => setEditingStudentId(student.id)}
                  >
                    Edit Student
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={Boolean(editingStudent)}
        title={editingStudent ? `Edit ${editingStudent.name}` : "Edit student"}
        description="Update the student's status and enrolled courses."
        onClose={() => setEditingStudentId(null)}
      >
        {editingStudent ? (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-white">
                Enrolled Courses
              </p>
              <div className="mt-3 space-y-3">
                {courses.map((course) => {
                  const checked = editingStudent.enrolledCourseIds.includes(course.id);

                  return (
                    <label
                      key={course.id}
                      className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/6 p-4"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStudentCourse(editingStudent.id, course.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-400 focus:ring-sky-500"
                      />
                      <div>
                        <p className="font-medium text-white">
                          {course.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {course.tagline}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setEditingStudentId(null)}>Done</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  );
}
