"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface UploadCourseImageProps {
  onUpload: (url: string) => void;
  onError?: (error: string) => void;
}

function getUploadErrorMessage(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message?: string }).message || "")
        : "Failed to upload image";

  const normalized = message.toLowerCase();
  if (normalized.includes("row-level security") || normalized.includes("policy")) {
    return "Storage policy error: add INSERT and SELECT policies for bucket course-images in storage.objects.";
  }

  return message || "Failed to upload image";
}

export default function UploadCourseImage({
  onUpload,
  onError,
}: UploadCourseImageProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("FILE:", file);

    if (!file) {
      const message = "No file selected";
      console.log("UPLOAD ERROR:", message);
      setErrorMsg(message);
      onError?.(message);
      return;
    }

    if (!file.type.startsWith("image/")) {
      const message = "Selected file must be an image";
      console.log("UPLOAD ERROR:", message);
      setErrorMsg(message);
      onError?.(message);
      return;
    }

    setPreview(URL.createObjectURL(file));

    try {
      setUploading(true);
      setErrorMsg(null);

      const timestamp = Date.now();
      const extension = file.name.split(".").pop() || "jpg";
      const fileName = `course-${timestamp}.${extension}`;

      const { data, error } = await supabase.storage
        .from("course-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      console.log("UPLOAD:", data, error);

      if (error) {
        const message = getUploadErrorMessage(error);
        console.log("UPLOAD ERROR:", message);
        throw new Error(message);
      }

      const { data: urlData } = supabase.storage
        .from("course-images")
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;
      console.log("IMAGE URL:", imageUrl);

      if (!imageUrl) {
        throw new Error("Failed to generate public URL");
      }

      onUpload(imageUrl);
    } catch (err) {
      const message = getUploadErrorMessage(err);
      console.log("UPLOAD ERROR:", message);
      setErrorMsg(message);
      onError?.(message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`w-full border-2 border-dashed rounded-xl px-4 h-12 font-bold transition-colors ${
            uploading
              ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
              : "border-blue-300 text-blue-600 hover:bg-blue-50 cursor-pointer"
          }`}
        >
          {uploading ? "Uploading..." : "Select Image"}
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <p className="text-red-600 text-sm">{errorMsg}</p>
        </div>
      )}

      {preview && (
        <div className="flex justify-center">
          <img
            src={preview}
            alt="Preview"
            className="rounded-lg w-40 h-40 object-cover border border-gray-200"
          />
        </div>
      )}
    </div>
  );
}
