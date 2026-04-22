"use client";

import { useRef, useState } from "react";

import { supabase } from "@/lib/supabase/client";

interface UploadFileProps {
  onUpload: (url: string) => void;
}

function sanitizeFileName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

export default function UploadFile({ onUpload }: UploadFileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setError("Please select a file first.");
      return;
    }

    try {
      setError(null);
      setIsUploading(true);

      const safeOriginalName = sanitizeFileName(file.name) || "file";
      const fileName = `file-${Date.now()}-${safeOriginalName}`;

      const { error: uploadError } = await supabase.storage
        .from("course-files")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("course-files").getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      if (!publicUrl) {
        throw new Error("Failed to get public URL.");
      }

      onUpload(publicUrl);
      setUploadedFileName(file.name);
    } catch (uploadErr) {
      const message = uploadErr instanceof Error ? uploadErr.message : "Upload failed.";
      setError(message);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="bg-blue-600 text-white rounded-xl px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUploading ? "Uploading..." : "Upload File"}
      </button>

      {uploadedFileName ? (
        <p className="text-sm text-gray-700">Uploaded: {uploadedFileName}</p>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
