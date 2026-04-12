"use client";

import { FormEvent, useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { assignAdminPermissions, createAdmin, getAdmins } from "@/lib/api/lms";

export default function SuperAdminDashboardPage() {
  const { token } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [admins, setAdmins] = useState<Array<{
    id: string;
    email: string;
    adminProfile: {
      canManageCourses: boolean;
      canManageUsers: boolean;
      canManageContent: boolean;
      canManagePayments: boolean;
    } | null;
  }>>([]);

  useEffect(() => {
    if (!token) return;
    getAdmins(token).then((res) => setAdmins(res.admins)).catch(() => undefined);
  }, [token]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    await createAdmin(email, password, token);
    setMessage("Admin created successfully");
    setEmail("");
    setPassword("");
    const adminsResponse = await getAdmins(token);
    setAdmins(adminsResponse.admins);
  }

  async function onTogglePermission(
    adminId: string,
    key: "canManageCourses" | "canManageUsers" | "canManageContent" | "canManagePayments",
    value: boolean,
  ) {
    if (!token) return;
    const admin = admins.find((item) => item.id === adminId);
    const current = admin?.adminProfile ?? {
      canManageCourses: false,
      canManageUsers: false,
      canManageContent: false,
      canManagePayments: false,
    };
    await assignAdminPermissions(
      adminId,
      {
        ...current,
        [key]: value,
      },
      token,
    );
    const adminsResponse = await getAdmins(token);
    setAdmins(adminsResponse.admins);
  }

  return (
    <ProtectedRoute requiredRoles={["SUPER_ADMIN"]}>
      <section className="page-shell py-12">
        <div className="mx-auto w-full max-w-3xl px-5">
          <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email"
              className="h-11 w-full rounded bg-white/10 px-3 text-white"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Temporary password"
              type="password"
              className="h-11 w-full rounded bg-white/10 px-3 text-white"
            />
            <button className="rounded bg-indigo-500 px-4 py-2 text-white" type="submit">
              Create Admin
            </button>
          </form>
          {message ? <p className="mt-3 text-emerald-300">{message}</p> : null}
          <div className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-white">صلاحيات الأدمن</h2>
            {admins.map((admin) => {
              const profile = admin.adminProfile ?? {
                canManageCourses: false,
                canManageUsers: false,
                canManageContent: false,
                canManagePayments: false,
              };
              return (
                <div key={admin.id} className="rounded border border-white/10 p-3 text-slate-200">
                  <p className="font-semibold">{admin.email}</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {([
                      ["canManageCourses", "Manage Courses"],
                      ["canManageUsers", "Manage Users"],
                      ["canManageContent", "Manage Content"],
                      ["canManagePayments", "Manage Payments"],
                    ] as const).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={profile[key]}
                          onChange={(e) => onTogglePermission(admin.id, key, e.target.checked)}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}
