export const APP_CONFIG = {
  name: "منصة وليد زيادي",
  description:
    "منصة عربية لتعليم الرياضيات للمرحلة الثانوية مع تدريبات وامتحانات ونماذج مراجعة.",
  url: "https://example.com",
  locale: "ar",
  direction: "rtl" as const,
  rtlReadyLocales: ["ar", "he", "fa"],
};

export const CONTAINER_CLASS =
  "ds-container";

export const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/courses", label: "الكورسات" },
  { href: "/my-courses", label: "كورساتي" },
  { href: "/login", label: "تسجيل الدخول" },
  { href: "/register", label: "انشاء حساب" },
  { href: "/contact", label: "تواصل معنا" },
];
