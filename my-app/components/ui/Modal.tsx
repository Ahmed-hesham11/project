"use client";

import { ReactNode, useEffect } from "react";

import { Button } from "@/components/ui/Button";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.12)] p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold text-[var(--text-main)]">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          <Button variant="ghost" onClick={onClose} aria-label="Close modal">
            Close
          </Button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
