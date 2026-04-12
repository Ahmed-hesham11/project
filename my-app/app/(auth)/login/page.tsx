"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "فشل تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="section-reveal surface-card rounded-[34px] px-8 py-9 sm:px-10">
      <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(135deg,rgba(79,70,229,0.2),rgba(6,182,212,0.14),transparent)]" />
      <div className="relative">
        <span className="inline-flex rounded-full border border-sky-300/20 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-200 shadow-sm">
          تسجيل الدخول
        </span>
        <h1 className="mt-5 text-3xl font-bold text-white">
          رجوع سريع وآمن إلى حسابك
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-300">
          ادخل بياناتك للوصول إلى الكورسات والمتابعة والاختبارات من مكان واحد.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input
            label="البريد الإلكتروني"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
          <Input
            label="كلمة المرور"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="interactive-lift h-12 w-full rounded-2xl bg-[linear-gradient(135deg,var(--primary),var(--secondary))] text-base font-semibold text-white shadow-[0_20px_36px_-18px_rgba(79,70,229,0.42)]"
          >
            {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </form>

        <p className="mt-6 text-sm text-slate-400">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="font-semibold text-sky-200 hover:text-white">
            أنشئ حسابك الآن
          </Link>
        </p>
      </div>
    </section>
  );
}
