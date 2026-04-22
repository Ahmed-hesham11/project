"use client";

interface CourseImageDisplayProps {
  course: {
    id: string;
    title: string;
    image?: string | null;
    thumbnail_url?: string | null;
  };
  fallback?: string;
}

export default function CourseImageDisplay({
  course,
  fallback = "/images/logo.jpg",
}: CourseImageDisplayProps) {
  console.log("\n=== STEP 4: DISPLAY IMAGE IN FRONTEND ===");
  console.log("COURSE:", course);
  console.log("COURSE IMAGE:", course.image);
  console.log("COURSE THUMBNAIL:", course.thumbnail_url);

  // Determine which image to use - ONLY use fallback if empty
  const imageUrl = course.image || course.thumbnail_url;

  console.log("RESOLVED IMAGE URL:", imageUrl);
  console.log("IMAGE FIELD EMPTY:", !imageUrl);
  console.log("USING FALLBACK:", !imageUrl);

  const displayUrl = imageUrl || fallback;

  return (
    <div className="relative w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
      <img
        src={displayUrl}
        alt={course.title}
        className="w-full h-full object-cover"
        onError={() => {
          if (imageUrl) {
            console.error("❌ IMAGE FAILED TO LOAD:", imageUrl);
            console.error("COURSE ID:", course.id);
            console.error("COURSE TITLE:", course.title);
          } else {
            console.log("✓ USING FALLBACK IMAGE");
          }
        }}
        onLoad={() => {
          if (imageUrl) {
            console.log("✓ IMAGE LOADED SUCCESSFULLY:", imageUrl);
          }
        }}
      />
    </div>
  );
}
