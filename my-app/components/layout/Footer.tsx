function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.6 1.6-1.6h1.3V4.8c-.2 0-1-.1-2-.1-2.1 0-3.5 1.3-3.5 3.7V11H8.5v3h2.4v7h2.6Z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M21.2 8.1a2.9 2.9 0 0 0-2-2.1C17.4 5.5 12 5.5 12 5.5s-5.4 0-7.2.5a2.9 2.9 0 0 0-2 2.1c-.5 1.9-.5 3.9-.5 3.9s0 2 .5 3.9a2.9 2.9 0 0 0 2 2.1c1.8.5 7.2.5 7.2.5s5.4 0 7.2-.5a2.9 2.9 0 0 0 2-2.1c.5-1.9.5-3.9.5-3.9s0-2-.5-3.9ZM10 15.2V8.8l5.2 3.2L10 15.2Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-[linear-gradient(180deg,#ffffff_0%,#dff3ff_35%,#2563eb_100%)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-center sm:px-6 lg:px-8">
        <div className="flex items-center gap-3" dir="rtl">
          <a
            href="https://www.facebook.com/1waleedzabady"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm transition-all duration-300 hover:bg-blue-100 hover:-translate-y-0.5"
          >
            <FacebookIcon />
          </a>
          <a
            href="https://www.youtube.com/@1waleedzabady/videos"
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-600 shadow-sm transition-all duration-300 hover:bg-red-100 hover:-translate-y-0.5"
          >
            <YoutubeIcon />
          </a>
        </div>

        <p className="text-sm text-white/90" dir="rtl">
          © 2026 منصة تعليم الرياضيات - جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}
