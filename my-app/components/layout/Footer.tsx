import Link from "next/link";

import { CONTAINER_CLASS } from "@/lib/constants";

const examLinks = [
  { href: "/login", label: "امتحانات سابقة" },
  { href: "/courses", label: "نماذج ومراجعات" },
  { href: "/register", label: "أنشئ حسابك" },
];

const contactLinks = [
  { href: "/dashboard", label: "لوحة التحكم" },
  { href: "/login", label: "الدخول للحساب" },
  { href: "/register", label: "الدعم والاشتراك" },
];

export function Footer() {
  const quickLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/courses", label: "الكورسات" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(30,41,59,0.98))] text-white">
      <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.28),transparent_36%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.22),transparent_30%)]" />
      <div className={`${CONTAINER_CLASS} relative py-12 md:py-14`}>
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.8fr_0.8fr_1fr]">
          <div className="text-right">
            <div className="flex items-start justify-end gap-3">
              <div>
                <p className="font-display text-[1.55rem] font-bold text-white">
                  منصة وليد زبادي
                </p>
                <p className="mt-3 max-w-[320px] text-base leading-8 text-slate-300">
                  منصة متخصصة في تعليم الرياضيات للمرحلة الثانوية بتجربة أوضح،
                  أسرع، وأكثر احترافية.
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,var(--primary),var(--secondary))] text-lg font-black text-white shadow-[0_18px_34px_-18px_rgba(79,70,229,0.44)]">
                و
              </div>
            </div>
          </div>

          <div className="text-right">
            <h3 className="text-[1.2rem] font-bold text-white">
              روابط سريعة
            </h3>
            <div className="mt-4 space-y-2.5">
              {quickLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-base text-slate-300 transition hover:text-sky-300"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="text-right">
            <h3 className="text-[1.2rem] font-bold text-white">
              التعلّم
            </h3>
            <div className="mt-4 space-y-2.5">
              {examLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-base text-slate-300 transition hover:text-sky-300"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="text-right">
            <h3 className="text-[1.2rem] font-bold text-white">
              تواصل وخدمات
            </h3>
            <div className="mt-4 space-y-2.5">
              {contactLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-base text-slate-300 transition hover:text-sky-300"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 h-px bg-white/10" />
        <div className="pt-6 text-center text-base text-slate-300 md:text-lg">
          جميع الحقوق محفوظة | Waleed Zbady Mathematics Platform 2026 ©
        </div>
      </div>
    </footer>
  );
}
