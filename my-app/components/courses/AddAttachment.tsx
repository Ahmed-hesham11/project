"use client";

import { FormEvent, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase/client";
import type { Attachment } from "@/types/attachment";

import UploadFile from "./UploadFile";

interface AddAttachmentProps {
  courseId: string;
  onAdded?: (attachment: Attachment) => void;
}

function detectTypeFromUrl(url: string) {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.endsWith(".pdf")) {
    return "pdf";
  }

  if (/\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?|$)/i.test(lowerUrl)) {
    return "video";
  }

  return "file";
}

export default function AddAttachment({ courseId, onAdded }: AddAttachmentProps) {
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const attachmentType = useMemo(() => detectTypeFromUrl(fileUrl), [fileUrl]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!fileUrl) {
      setError("Please upload a file first.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        course_id: courseId,
        title: title.trim(),
        file_url: fileUrl,
        type: attachmentType,
      };

      const { data, error: insertError } = await supabase
        .from("attachments")
        .insert(payload)
        .select("id, course_id, title, file_url, type")
        .single();

      if (insertError) {
        throw insertError;
      }

      setSuccess("Attachment saved successfully.");
      setTitle("");
      setFileUrl("");

      onAdded?.(data as Attachment);
    } catch (submitErr) {
      const message = submitErr instanceof Error ? submitErr.message : "Failed to save attachment.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="space-y-2">
        <label htmlFor="attachment-title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="attachment-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter attachment title"
          className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
        />
      </div>

      <UploadFile onUpload={setFileUrl} />

      {fileUrl ? <p className="text-sm text-gray-700 break-all">URL: {fileUrl}</p> : null}
      {fileUrl ? <p className="text-sm text-gray-500">Detected type: {attachmentType}</p> : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-green-600">{success}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 text-white rounded-xl px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Attachment"}
      </button>
    </form>
  );
}
