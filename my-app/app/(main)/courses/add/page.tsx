"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import UploadCourseImage from "@/components/courses/UploadCourseImage";

export default function AddCoursePage() {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savedCourseImage, setSavedCourseImage] = useState("");

  const handleImageUpload = (url: string) => {
    console.log("IMAGE URL:", url);
    setImageUrl(url);
    setError(null);
  };

  const handleImageError = (message: string) => {
    console.log("UPLOAD ERROR:", message);
    setError(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    console.log("FORM DATA:", { title, image: imageUrl });

    if (!title.trim()) {
      setError("Please enter a course title");
      return;
    }

    if (!imageUrl) {
      setError("Please upload a course image");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: title.trim(),
        image: imageUrl,
      };

      console.log("INSERT DATA:", payload);

      const { data, error: insertError } = await supabase
        .from("courses")
        .insert(payload)
        .select()
        .single();

      console.log("INSERT RESULT:", data, insertError);

      if (insertError) {
        throw insertError;
      }

      console.log("COURSE IMAGE:", data?.image);

      setSavedCourseImage((data?.image as string) || "");
      setSuccess("Course created successfully");
      setTitle("");
      setImageUrl("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create course";
      console.log("DB INSERT ERROR:", message);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-xl space-y-5">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Add Course</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Course Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter course title"
                disabled={submitting}
                className="w-full border rounded-xl px-4 h-12"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Course Image
              </label>
              <UploadCourseImage
                onUpload={handleImageUpload}
                onError={handleImageError}
              />
            </div>

            {imageUrl && (
              <div className="flex justify-center">
                <img
                  src={imageUrl}
                  alt="Uploaded preview"
                  className="w-40 rounded-lg"
                  onLoad={() => console.log("COURSE IMAGE:", imageUrl)}
                  onError={() => console.log("COURSE IMAGE:", "")}
                />
                </div>
            )}

            <button
              type="submit"
              disabled={submitting || !title.trim() || !imageUrl}
              className="w-full bg-blue-600 text-white rounded-xl h-12 font-bold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? "Creating..." : "Create Course"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
          <p className="text-sm font-semibold text-slate-700">Saved Image</p>
          <img
            src={savedCourseImage || "/images/logo.jpg"}
            alt="Saved course image"
            className="w-40 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
