"use client";

import { Search, UserCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { updateMe } from "@/lib/api/auth";

interface DashboardTopbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  userName: string;
  userRole: string;
}

export function DashboardTopbar({
  search,
  onSearchChange,
  userName,
  userRole,
}: DashboardTopbarProps) {
  const { token, user, refreshUser } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
  });

  const hasEditableProfile = Boolean(user?.profile);

  useEffect(() => {
    setProfileForm({
      email: user?.email ?? "",
      firstName: user?.profile?.firstName ?? "",
      lastName: user?.profile?.lastName ?? "",
    });
  }, [user]);

  const profileDisplayName = useMemo(() => {
    const first = user?.profile?.firstName?.trim();
    const last = user?.profile?.lastName?.trim();
    if (first || last) {
      return `${first ?? ""} ${last ?? ""}`.trim();
    }
    return userName;
  }, [user?.profile?.firstName, user?.profile?.lastName, userName]);

  async function handleSaveProfile() {
    if (!token) {
      setSaveError("Please login again");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const payload: { email?: string; firstName?: string; lastName?: string } = {};

      if (profileForm.email.trim() && profileForm.email.trim() !== (user?.email ?? "")) {
        payload.email = profileForm.email.trim();
      }

      if (hasEditableProfile) {
        const firstName = profileForm.firstName.trim();
        const lastName = profileForm.lastName.trim();
        if (firstName && firstName !== (user?.profile?.firstName ?? "")) {
          payload.firstName = firstName;
        }
        if (lastName && lastName !== (user?.profile?.lastName ?? "")) {
          payload.lastName = lastName;
        }
      }

      if (!Object.keys(payload).length) {
        setSaveSuccess("No changes to save");
        return;
      }

      await updateMe(payload, token);
      await refreshUser();
      setSaveSuccess("Profile updated");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-main)]/95 p-4 shadow-sm backdrop-blur sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search courses..."
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] pl-10 pr-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--primary)]"
            />
          </label>

          <div className="flex items-center justify-end gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-[var(--text-main)]">{profileDisplayName}</p>
              <p className="text-xs text-[var(--text-muted)]">{userRole}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] transition hover:border-[var(--primary)]/40 hover:bg-[var(--hover-soft)]"
              aria-label="Open profile"
            >
              <UserCircle2 className="h-6 w-6 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={isProfileOpen}
        title="Profile"
        description="Review and update your account info."
        onClose={() => setIsProfileOpen(false)}
      >
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={profileForm.email}
            onChange={(event) =>
              setProfileForm((current) => ({ ...current, email: event.target.value }))
            }
          />

          <Input
            label="First name"
            value={profileForm.firstName}
            onChange={(event) =>
              setProfileForm((current) => ({ ...current, firstName: event.target.value }))
            }
            disabled={!hasEditableProfile}
            hint={
              hasEditableProfile
                ? undefined
                : "Name editing is available only for accounts with a profile record"
            }
          />

          <Input
            label="Last name"
            value={profileForm.lastName}
            onChange={(event) =>
              setProfileForm((current) => ({ ...current, lastName: event.target.value }))
            }
            disabled={!hasEditableProfile}
          />

          {saveError ? <p className="text-sm text-rose-600">{saveError}</p> : null}
          {saveSuccess ? <p className="text-sm text-emerald-600">{saveSuccess}</p> : null}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsProfileOpen(false)}>
              Close
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
