"use client";

interface VideoPlayerProps {
  videoId: string;
}

function extractVimeoId(input: string): string {
  const value = input.trim();

  if (!value) {
    return "";
  }

  if (!value.includes("vimeo.com")) {
    return value;
  }

  try {
    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? "";
  } catch {
    return value;
  }
}

export default function VideoPlayer({ videoId }: VideoPlayerProps) {
  const normalizedId = extractVimeoId(videoId);

  if (!normalizedId) {
    return null;
  }

  const src = `https://player.vimeo.com/video/${normalizedId}?title=0&byline=0&portrait=0&badge=0&autopause=1&dnt=1`;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="rounded-2xl overflow-hidden shadow-2xl bg-black">
        <div className="aspect-video w-full">
          <iframe
            className="h-full w-full"
            src={src}
            title="Course video player"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
