"use client";

import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase/client";
import type { Attachment } from "@/types/attachment";

interface AttachmentsListProps {
  courseId?: string;
  attachments?: Attachment[];
}

function getFileLabel(type: string) {
  const normalizedType = type.toLowerCase();

  if (normalizedType.includes("pdf")) {
    return "PDF File";
  }

  if (normalizedType.includes("video")) {
    return "Video File";
  }

  return "File";
}

export default function AttachmentsList({ courseId, attachments }: AttachmentsListProps) {
  const [items, setItems] = useState<Attachment[]>(attachments ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shouldFetch = useMemo(() => !attachments && !!courseId, [attachments, courseId]);

  useEffect(() => {
    const fetchAttachments = async () => {
      if (!courseId) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("attachments")
          .select("id, course_id, title, file_url, type")
          .eq("course_id", courseId);

        if (fetchError) {
          throw fetchError;
        }

        setItems((data ?? []) as Attachment[]);
      } catch (fetchErr) {
        const message = fetchErr instanceof Error ? fetchErr.message : "Failed to load attachments.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (shouldFetch) {
      fetchAttachments();
    }
  }, [courseId, shouldFetch]);

  if (loading) {
    return <p className="text-sm text-gray-600">Loading attachments...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!items.length) {
    return <p className="text-sm text-gray-600">No attachments yet.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((attachment) => (
        <div
          key={attachment.id}
          className="rounded-2xl border border-gray-200 bg-white p-4 flex items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <p className="font-semibold text-gray-900">{attachment.title}</p>
            <p className="text-sm text-gray-500">{getFileLabel(attachment.type)}</p>
          </div>
          <a
            href={attachment.file_url}
            target="_blank"
            rel="noreferrer"
            className="bg-blue-600 text-white rounded-xl px-4 py-2"
          >
            Open File
          </a>
        </div>
      ))}
    </div>
  );
}
