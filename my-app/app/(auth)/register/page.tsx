"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Phone, Mail, User, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";

interface FormData {
  firstName: string;
  secondName: string;
  thirdName: string;
  fourthName: string;
  studentPhone: string;
  parentPhone: string;
  governorate: string;
  educationType: string;
  grade: string;
  specialization: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

const GOVERNORATES = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "الدقهلية",
  "البحر الأحمر",
  "البحيرة",
  "الفيوم",
  "الغربية",
  "الإسماعيلية",
  "المنوفية",
  "المنيا",
  "القليوبية",
  "الوادي الجديد",
  "السويس",
  "أسوان",
  "أسيوط",
  "بني سويف",
  "بورسعيد",
  "دمياط",
  "الشرقية",
  "جنوب سيناء",
  "كفر الشيخ",
  "مطروح",
  "الأقصر",
  "قنا",
  "شمال سيناء",
  "سوهاج",
];

const EDUCATION_TYPES = ["عام", "أزهري"];

const GRADES = ["الصف الأول الثانوي", "الصف الثاني الثانوي", "الصف الثالث الثانوي"];

const SPECIALIZATIONS = ["علمي علوم", "علمي رياضة", "أدبي"];

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  icon?: React.ElementType;
  required?: boolean;
  maxLength?: number;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const FormField = ({
  label,
  name,
  type = "text",
  placeholder,
  icon: Icon,
  required = true,
  maxLength,
  value,
  onChange,
  error,
}: FormFieldProps) => (
  <div className="flex min-h-[88px] flex-col gap-2">
    <label className="block text-sm font-semibold text-gray-700">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full h-14 rounded-xl border bg-white px-4 py-3 pr-12 text-gray-900 shadow-sm transition-all duration-200 outline-none ${
          error
            ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-30"
            : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        } placeholder:text-gray-400`}
      />
      {Icon ? (
        <Icon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
      ) : null}
    </div>
    <p className={`text-xs ${error ? "text-red-500" : "invisible"}`}>{error || "."}</p>
  </div>
);

interface SelectFieldProps {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
}

const SelectField = ({
  label,
  name,
  options,
  required = true,
  value,
  onChange,
  error,
}: SelectFieldProps) => (
  <div className="flex min-h-[88px] flex-col gap-2">
    <label className="block text-sm font-semibold text-gray-700">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full h-14 rounded-xl border bg-white px-4 py-3 text-gray-900 shadow-sm transition-all duration-200 outline-none ${
        error
          ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-30"
          : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      }`}
    >
      <option value="">اختر {label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    <p className={`text-xs ${error ? "text-red-500" : "invisible"}`}>{error || "."}</p>
  </div>
);

interface PasswordFieldProps {
  label: string;
  name: string;
  show: boolean;
  setShow: (show: boolean) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const PasswordField = ({
  label,
  name,
  show,
  setShow,
  value,
  onChange,
  error,
}: PasswordFieldProps) => (
  <div className="flex min-h-[88px] flex-col gap-2">
    <label className="block text-sm font-semibold text-gray-700">
      {label}
      <span className="ml-1 text-red-500">*</span>
    </label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder="........"
        className={`w-full h-14 rounded-xl border bg-white px-4 py-3 pl-12 pr-12 text-gray-900 shadow-sm transition-all duration-200 outline-none ${
          error
            ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-30"
            : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        }`}
      />
      <Lock className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute left-4 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors duration-200 hover:text-gray-600"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
    <p className={`text-xs ${error ? "text-red-500" : "invisible"}`}>{error || "."}</p>
  </div>
);

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    secondName: "",
    thirdName: "",
    fourthName: "",
    studentPhone: "",
    parentPhone: "",
    governorate: "",
    educationType: "",
    grade: "الصف الثالث الثانوي",
    specialization: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateEgyptianPhone = (phone: string): boolean => {
    const egyptianPhoneRegex = /^(01)[0-2,5]\d{8}$/;
    return egyptianPhoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "الاسم الأول مطلوب";
    if (!formData.secondName.trim()) newErrors.secondName = "الاسم الثاني مطلوب";
    if (!formData.thirdName.trim()) newErrors.thirdName = "الاسم الثالث مطلوب";
    if (!formData.fourthName.trim()) newErrors.fourthName = "الاسم الرابع مطلوب";

    if (!formData.studentPhone.trim()) {
      newErrors.studentPhone = "رقم الطالب مطلوب";
    } else if (!validateEgyptianPhone(formData.studentPhone)) {
      newErrors.studentPhone = "رقم الهاتف غير صحيح";
    }

    if (!formData.parentPhone.trim()) {
      newErrors.parentPhone = "رقم ولي الأمر مطلوب";
    } else if (!validateEgyptianPhone(formData.parentPhone)) {
      newErrors.parentPhone = "رقم الهاتف غير صحيح";
    }

    if (formData.studentPhone === formData.parentPhone) {
      newErrors.studentPhone = "رقم الطالب يجب أن يكون مختلف عن رقم ولي الأمر";
      newErrors.parentPhone = "رقم ولي الأمر يجب أن يكون مختلف عن رقم الطالب";
    }

    if (!formData.governorate) newErrors.governorate = "اختر المحافظة";
    if (!formData.educationType) newErrors.educationType = "اختر نوع التعليم";
    if (!formData.specialization) newErrors.specialization = "اختر التخصص";

    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "تأكيد كلمة المرور مطلوب";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمات المرور غير متطابقة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    let { value } = e.target;

    const maxLengths: { [key: string]: number } = {
      studentPhone: 11,
      parentPhone: 11,
    };

    if (maxLengths[name] && value.length > maxLengths[name]) {
      value = value.substring(0, maxLengths[name]);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await register({
        firstName: formData.firstName,
        secondName: formData.secondName,
        thirdName: formData.thirdName,
        fourthName: formData.fourthName,
        studentPhone: formData.studentPhone,
        parentPhone: formData.parentPhone,
        email: formData.email,
        governorate: formData.governorate,
        educationType: formData.educationType,
        grade: formData.grade,
        specialization: formData.specialization,
        password: formData.password,
      });
      router.push("/dashboard");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f8ff] px-4 py-6 sm:px-6 md:py-10">
      <Card className="section-reveal w-full max-w-[720px] rounded-2xl border border-gray-200 bg-white p-5 shadow-xl sm:p-7 md:p-10">
        <div className="mb-8 text-center md:mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            تسجيل جديد
          </p>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
            أنشئ حسابك الآن
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto grid max-w-[640px] grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 md:gap-x-6 md:gap-y-5">
          <FormField
            label="الاسم الأول"
            name="firstName"
            placeholder="محمد"
            icon={User}
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
          />
          <FormField
            label="الاسم الثاني"
            name="secondName"
            placeholder="أحمد"
            icon={User}
            value={formData.secondName}
            onChange={handleChange}
            error={errors.secondName}
          />

          <FormField
            label="الاسم الثالث"
            name="thirdName"
            placeholder="علي"
            icon={User}
            value={formData.thirdName}
            onChange={handleChange}
            error={errors.thirdName}
          />
          <FormField
            label="الاسم الرابع"
            name="fourthName"
            placeholder="محمود"
            icon={User}
            value={formData.fourthName}
            onChange={handleChange}
            error={errors.fourthName}
          />

          <FormField
            label="رقم الطالب"
            name="studentPhone"
            type="tel"
            placeholder="01012345678"
            icon={Phone}
            value={formData.studentPhone}
            onChange={handleChange}
            error={errors.studentPhone}
          />
          <FormField
            label="رقم ولي الأمر"
            name="parentPhone"
            type="tel"
            placeholder="01098765432"
            icon={Phone}
            value={formData.parentPhone}
            onChange={handleChange}
            error={errors.parentPhone}
          />

          <div className="md:col-span-2">
            <SelectField
              label="المحافظة"
              name="governorate"
              options={GOVERNORATES}
              value={formData.governorate}
              onChange={handleChange}
              error={errors.governorate}
            />
          </div>

          <div className="md:col-span-2">
            <SelectField
              label="نوع التعليم"
              name="educationType"
              options={EDUCATION_TYPES}
              value={formData.educationType}
              onChange={handleChange}
              error={errors.educationType}
            />
          </div>

          <div className="md:col-span-2">
            <SelectField
              label="الصف الدراسي"
              name="grade"
              options={GRADES}
              value={formData.grade}
              onChange={handleChange}
              error={errors.grade}
            />
          </div>

          <div className="md:col-span-2">
            <SelectField
              label="التخصص"
              name="specialization"
              options={SPECIALIZATIONS}
              value={formData.specialization}
              onChange={handleChange}
              error={errors.specialization}
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              label="البريد الإلكتروني"
              name="email"
              type="email"
              placeholder="your@example.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
          </div>

          <PasswordField
            label="كلمة المرور"
            name="password"
            show={showPassword}
            setShow={setShowPassword}
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          <PasswordField
            label="تأكيد كلمة المرور"
            name="confirmPassword"
            show={showConfirmPassword}
            setShow={setShowConfirmPassword}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="mt-3 h-14 w-full rounded-xl bg-blue-600 text-white font-semibold transition-all duration-300 hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
          >
            {isLoading ? "جاري إنشاء الحساب..." : "انشئ الحساب"}
          </button>
          {submitError ? <p className="text-sm text-rose-500 md:col-span-2">{submitError}</p> : null}
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 md:mt-8">
          يوجد لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
            تسجيل الدخول
          </Link>
        </p>
      </Card>
    </div>
  );
}
