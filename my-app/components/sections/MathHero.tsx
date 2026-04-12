"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function MathHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[linear-gradient(135deg,_rgb(79_70_229_/_0.08),_rgb(6_182_212_/_0.08),_transparent)] dark:bg-[linear-gradient(90deg,_#16213b_0%,_#10223a_52%,_#0f2840_100%)]"
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-[9%] top-[18%] text-6xl font-bold text-sky-800/20 dark:text-sky-800/30">
          ∫
        </div>
        <div className="absolute right-[6%] top-[10%] text-[6rem] font-bold text-indigo-700/15 dark:text-indigo-700/20">
          ∑
        </div>
        <div className="absolute bottom-[12%] right-[18%] text-[4.8rem] font-bold text-emerald-800/15 dark:text-emerald-800/20">
          π
        </div>
        <div className="absolute bottom-[14%] left-[4%] text-5xl font-bold text-violet-700/15 dark:text-violet-700/20">
          √
        </div>
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-54px)] w-full max-w-[1400px] items-center gap-10 px-6 py-10 lg:grid-cols-[1.32fr_0.68fr] lg:px-8 xl:px-10">
        <div className="order-2 lg:order-1">
          <div
            className={`relative mx-auto max-w-[1200px] transition-all duration-700 ease-out lg:mr-0 lg:ml-0 lg:translate-x-14 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="hero-frame">
              <div className="relative bg-[rgb(15_23_42_/_0.18)] p-[5px]">
                <div className="relative overflow-hidden rounded-[1rem] border border-white/8 bg-[rgb(8_15_28_/_0.35)]">
                  <Image
                    src="/images/page2.jpg"
                    alt="صورة منصة وليد زبادي"
                    width={1600}
                    height={1350}
                    priority
                    sizes="(max-width: 1024px) 100vw, 760px"
                    className="h-auto w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`order-1 flex flex-col items-start text-right transition-all duration-700 delay-150 ease-out lg:order-2 lg:items-start ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h1 className="mt-10 max-w-[560px] font-display text-5xl font-bold leading-tight tracking-tight text-[var(--text-primary)] md:text-6xl">
            ليه احنا؟
          </h1>

          <p className="mt-6 max-w-[590px] text-base leading-relaxed text-[var(--text-secondary)] md:text-xl">
            لأن طلبة كتير بتواجه صعوبة في فهم الرياضيات وحل المسائل
            وفرتلك في المنصة كل الي نفسك فيه عشان اخليلك المادة بسيطة
            ومُمتعة
          </p>
        </div>
      </div>
    </section>
  );
}
