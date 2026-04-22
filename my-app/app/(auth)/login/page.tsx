"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    studentPhone: "",
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
      await login(formData.studentPhone, formData.password);
      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "فشل تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section dir="rtl" className="min-h-screen bg-[#f4f8ff] px-4">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center">
        <div className="w-full rounded-2xl bg-white px-10 py-[58px] shadow-xl">
          <div className="text-center">
            <span className="inline-flex rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-600">
              تسجيل الدخول
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-gray-900 lg:text-4xl">
              سجّل دخولك وكمّل رحلتك بسهولة
            </h1>
            <p className="mt-3 text-base leading-relaxed text-gray-600">
              اكتب رقم الهاتف وكلمة المرور للوصول إلى الكورسات والمتابعة من مكان واحد.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2 text-right">
              <label htmlFor="studentPhone" className="text-sm font-semibold text-gray-700">
                رقم الهاتف المسجل
              </label>
              <input
                id="studentPhone"
                type="tel"
                name="studentPhone"
                value={formData.studentPhone}
                onChange={handleChange}
                placeholder="01xxxxxxxxx"
                inputMode="numeric"
                autoComplete="tel"
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div className="space-y-2 text-right">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                autoComplete="current-password"
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl bg-blue-600 text-base font-bold text-white shadow-lg transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
            </button>

            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            ) : null}
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            ليس لديك حساب بعد؟{" "}
            <Link href="/register" className="font-semibold text-blue-600 underline-offset-4 hover:underline">
              أنشئ حسابك الآن
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
