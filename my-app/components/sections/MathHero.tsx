"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function MathHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleScroll() {
      const viewport = window.innerHeight || 1;
      const progress = Math.min(window.scrollY / (viewport * 0.9), 1);
      setScrollProgress(progress);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const gradientStop = 62 + scrollProgress * 24;
  const whiteOpacity = 0.08 + scrollProgress * 0.92;

  return (
    <section
      ref={sectionRef}
      style={{
        background: `linear-gradient(180deg, #2563eb 0%, #38bdf8 ${gradientStop}%, rgba(255,255,255,${whiteOpacity}) 100%)`,
      }}
      className="relative isolate overflow-hidden py-16 lg:py-20"
    >
      {/* خلفية */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.1),transparent_30%)]" />

      <div className="ds-container relative z-10 flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-10 lg:flex-row lg:gap-20">

        {/* 🟦 الصورة (شمال) */}
        <div className="order-1 w-full max-w-[900px] lg:order-2 lg:w-1/2">
          <div className={isVisible ? "hero-slide-left" : "opacity-0"}>
            <div className="relative overflow-hidden rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <Image
                src="/images/page2.jpg"
                alt="شرح الرياضيات"
                width={1200}
                height={800}
                priority
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* 🟦 النص (يمين) */}
        <div
          dir="rtl"
          className={`flex w-full lg:w-1/2 max-w-[600px] flex-col items-center text-center lg:items-end lg:text-right ${
            isVisible ? "hero-fade-up" : "opacity-0"
          } order-2 lg:order-1`}
        >
          <h1 className="font-display text-4xl font-bold leading-[1.3] text-white sm:text-5xl lg:text-6xl drop-shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            اتعلم الرياضيات بشكل أوضح وأسرع
          </h1>

          <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
            محتوى منظم، شرح عملي، واختبارات تفاعلية تخليك تبني الفهم خطوة بخطوة
            وتحقق نتائج أقوى في وقت أقل.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 translate-x-1 lg:translate-x-78 lg:justify-end">
            <Link
              href="/courses"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-orange-500 px-7 text-base font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-orange-600"
            >
              ابدأ التعلم الآن
            </Link>

            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/70 px-6 text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-white/10"
            >
              تواصل معنا
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}