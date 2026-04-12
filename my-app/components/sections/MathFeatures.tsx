interface FeatureItem {
  title: string;
  description: string;
  accent: string;
  glow: string;
  iconBg: string;
  icon: "layers" | "path" | "quiz" | "bank" | "analytics" | "video";
}

const featureItems: FeatureItem[] = [
  {
    title: "محتوى منظم",
    description: "جبر وتفاضل وهندسة وحساب مثلثات داخل مسار واضح وسهل المتابعة.",
    accent: "text-emerald-300",
    glow: "from-emerald-500/18 via-emerald-300/10 to-transparent",
    iconBg: "border-emerald-400/20 bg-emerald-400/10",
    icon: "layers",
  },
  {
    title: "حل خطوة بخطوة",
    description: "شرح الفكرة قبل الحل حتى يفهم الطالب طريقة التفكير بنفسه.",
    accent: "text-sky-300",
    glow: "from-sky-500/18 via-cyan-300/10 to-transparent",
    iconBg: "border-sky-400/20 bg-sky-400/10",
    icon: "path",
  },
  {
    title: "اختبارات تفاعلية",
    description: "تدريبات وأسئلة بعد كل جزء مع تغذية راجعة سريعة وواضحة.",
    accent: "text-indigo-300",
    glow: "from-indigo-500/18 via-violet-300/10 to-transparent",
    iconBg: "border-indigo-400/20 bg-indigo-400/10",
    icon: "quiz",
  },
  {
    title: "بنك أسئلة كبير",
    description: "مجموعة واسعة من المسائل المتدرجة لتثبيت الفهم والاستعداد للامتحان.",
    accent: "text-rose-300",
    glow: "from-rose-500/18 via-orange-300/10 to-transparent",
    iconBg: "border-rose-400/20 bg-rose-400/10",
    icon: "bank",
  },
  {
    title: "متابعة مستوى الطالب",
    description: "قراءة سريعة للأداء ونقاط الضعف والتحسن أولًا بأول.",
    accent: "text-amber-300",
    glow: "from-amber-500/18 via-yellow-300/10 to-transparent",
    iconBg: "border-amber-400/20 bg-amber-400/10",
    icon: "analytics",
  },
  {
    title: "فيديوهات احترافية",
    description: "شرح هادئ وواضح بجودة بصرية أفضل وتجربة تعلم أكثر احترافية.",
    accent: "text-violet-300",
    glow: "from-violet-500/18 via-indigo-300/10 to-transparent",
    iconBg: "border-violet-400/20 bg-violet-400/10",
    icon: "video",
  },
];

function FeatureIcon({ type }: { type: FeatureItem["icon"] }) {
  const commonProps = {
    "aria-hidden": "true",
    viewBox: "0 0 24 24",
    className: "h-6 w-6",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
  } as const;

  if (type === "layers") {
    return (
      <svg {...commonProps}>
        <path d="M12 4 5 7.5 12 11l7-3.5L12 4Z" strokeLinejoin="round" />
        <path d="M5 12l7 3.5 7-3.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 16.5 12 20l7-3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "path") {
    return (
      <svg {...commonProps}>
        <path d="M6 18c0-1.7 1.3-3 3-3h1.5a2.5 2.5 0 1 0 0-5H9" strokeLinecap="round" />
        <circle cx="7" cy="18" r="1.5" />
        <circle cx="17" cy="7" r="1.5" />
      </svg>
    );
  }

  if (type === "quiz") {
    return (
      <svg {...commonProps}>
        <rect x="5" y="4.5" width="14" height="15" rx="3" />
        <path d="M9 9h6M9 13h3" strokeLinecap="round" />
        <path d="m14.5 15.5 1.5 1.5 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "bank") {
    return (
      <svg {...commonProps}>
        <path d="M4.5 9.5 12 5l7.5 4.5" strokeLinejoin="round" />
        <path d="M6.5 10.5v7M10.5 10.5v7M13.5 10.5v7M17.5 10.5v7" strokeLinecap="round" />
        <path d="M4 18.5h16" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "analytics") {
    return (
      <svg {...commonProps}>
        <path d="M5 18.5h14" strokeLinecap="round" />
        <path d="M7.5 16v-4M12 16V8M16.5 16v-6" strokeLinecap="round" />
        <path d="m7.5 9.5 4.5-3 4.5 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <rect x="4.5" y="6" width="15" height="12" rx="3" />
      <path d="M10 10.5 15 12 10 13.5v-3Z" strokeLinejoin="round" />
    </svg>
  );
}

export function MathFeatures() {
  return (
    <section className="relative overflow-hidden border-t border-white/8 bg-[linear-gradient(180deg,rgba(8,17,31,0.98),rgba(15,23,42,1),rgba(17,28,49,1))] py-18">
      <div className="absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.2),transparent_34%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.16),transparent_28%)]" />
      <div className="mx-auto w-full max-w-[1400px] px-5 lg:px-8 xl:px-10">
        <div className="section-reveal relative text-center">
          <span className="inline-flex rounded-full border border-sky-300/20 bg-sky-400/10 px-6 py-3 text-lg font-bold text-sky-200 shadow-sm">
            مزايا المنصة
          </span>
          <h2 className="mt-5 font-display text-4xl font-bold leading-normal text-white">
            تجربة تعلم أكثر وضوحًا واحترافية
          </h2>
        </div>

        <div className="relative mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featureItems.map((item, index) => (
            <article
              key={item.title}
              className="dashboard-card section-reveal relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(30,41,59,0.84))] px-8 py-8 shadow-[0_24px_50px_-32px_rgba(2,8,23,0.8)]"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${item.glow}`} />
              <div
                className={`relative flex h-14 w-14 items-center justify-center rounded-[18px] border ${item.iconBg} ${item.accent} shadow-sm`}
              >
                <FeatureIcon type={item.icon} />
              </div>
              <h3 className="relative mt-10 text-right text-xl font-semibold leading-normal text-white">
                {item.title}
              </h3>
              <p className="relative mt-4 text-right text-base leading-8 text-slate-300">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
