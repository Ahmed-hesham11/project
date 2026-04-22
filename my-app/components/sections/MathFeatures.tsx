interface FeatureItem {
  title: string;
  description: string;
  icon: "layers" | "path" | "quiz" | "bank" | "analytics" | "video";
}

const featureItems: FeatureItem[] = [
  {
    title: "محتوى منظم",
    description: "جبر وتفاضل وهندسة وحساب مثلثات داخل مسار واضح وسهل المتابعة.",
    icon: "layers",
  },
  {
    title: "حل خطوة بخطوة",
    description: "شرح الفكرة قبل الحل حتى يفهم الطالب طريقة التفكير بنفسه.",
    icon: "path",
  },
  {
    title: "اختبارات تفاعلية",
    description: "تدريبات وأسئلة بعد كل جزء مع تغذية راجعة سريعة وواضحة.",
    icon: "quiz",
  },
  {
    title: "بنك أسئلة كبير",
    description: "مجموعة واسعة من المسائل المتدرجة لتثبيت الفهم والاستعداد للامتحان.",
    icon: "bank",
  },
  {
    title: "متابعة مستوى الطالب",
    description: "قراءة سريعة للأداء ونقاط الضعف والتحسن أولًا بأول.",
    icon: "analytics",
  },
  {
    title: "فيديوهات احترافية",
    description: "شرح هادئ وواضح بجودة بصرية أفضل وتجربة تعلم أكثر احترافية.",
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

function FeatureCard({ item, index }: { item: FeatureItem; index: number }) {
  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/80 p-7 shadow-md backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent opacity-0 transition-opacity duration-300 group-hover:border-blue-200/70 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-200/30 blur-2xl transition-all duration-300 group-hover:bg-blue-300/40" />

      <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white">
        <FeatureIcon type={item.icon} />
      </div>

      <h3 className="relative mt-6 text-right text-xl font-bold text-gray-900">
        {item.title}
      </h3>
      <p className="relative mt-3 text-right text-base leading-7 text-gray-600">
        {item.description}
      </p>
    </article>
  );
}

export function MathFeatures() {
  return (
    <section className="relative overflow-hidden border-t border-gray-100 bg-white py-16 lg:py-20">

      <div className="ds-container relative">
        <div className="section-reveal text-center max-w-3xl mx-auto">
          {/* badge */}
          <span className="inline-block bg-blue-100 text-blue-600 px-8 py-1.5 rounded-full text-base font-semibold shadow-sm">
            مزايا المنصة
          </span>

          {/* title */}
          <h2 className="mt-4 text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
            تجربة تعلم أكثر وضوحًا واحترافية
          </h2>

          {/* description */}
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            كل أداة في المنصة مصممة لتقليل التشتت، تسريع الفهم، وتحويل المذاكرة إلى تجربة منظمة وفعالة بنتائج واضحة.
          </p>
        </div>

        <div className="relative mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {featureItems.map((item, index) => (
            <FeatureCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
