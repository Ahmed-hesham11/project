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
  lastName: string;
  studentPhone: string;
  fatherPhone: string;
  motherPhone: string;
  governorate: string;
  educationType: string;
  grade: string;
  department: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

const GOVERNORATES = [
  "القاهرة",
  "الإسكندرية",
  "الجيزة",
  "الدقهلية",
  "البحيرة",
  "السويس",
  "المنوفية",
  "القليوبية",
  "الشرقية",
  "قنا",
  "الفيوم",
  "الوادي الجديد",
  "مطروح",
  "أسوان",
  "الأقصر",
  "سيناء",
];

const EDUCATION_TYPES = ["حكومي", "خاص", "أزهري"];

const GRADES = ["الصف الأول الثانوي", "الصف الثاني الثانوي", "الصف الثالث الثانوي"];

const DEPARTMENTS = ["علمي علوم", "علمي رياضة", "أدبي"];

// Move component definitions outside to prevent re-creation on every render
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
  <div className="flex flex-col">
    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full h-[52px] px-4 py-[14px] pr-12 rounded-[8px] border transition-all duration-200 outline-none ${
          error ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-30" : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20"
        } bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]`}
      />
      {Icon && <Icon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none" />}
    </div>
    {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
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
  <div className="flex flex-col">
    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full h-[52px] px-4 py-[14px] rounded-[8px] border transition-all duration-200 outline-none ${
        error ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-30" : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20"
      } bg-[var(--surface)] text-[var(--text-primary)]`}
    >
      <option value="">اختر {label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
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
  <div className="flex flex-col">
    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
      {label}
      <span className="text-red-500 ml-1">*</span>
    </label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder="••••••••"
        className={`w-full h-[52px] px-4 py-[14px] pr-12 pl-12 rounded-[8px] border transition-all duration-200 outline-none ${
          error ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-30" : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20"
        } bg-[var(--surface)] text-[var(--text-primary)]`}
      />
      <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none" />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors duration-200"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
    {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
  </div>
);

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    secondName: "",
    thirdName: "",
    lastName: "",
    studentPhone: "",
    fatherPhone: "",
    motherPhone: "",
    governorate: "",
    educationType: "",
    grade: "الصف الثالث الثانوي",
    department: "",
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

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = "الاسم الأول مطلوب";
    if (!formData.secondName.trim()) newErrors.secondName = "الاسم الثاني مطلوب";
    if (!formData.thirdName.trim()) newErrors.thirdName = "الاسم الثالث مطلوب";
    if (!formData.lastName.trim()) newErrors.lastName = "الاسم الأخير مطلوب";

    // Phone validation
    if (!formData.studentPhone.trim()) {
      newErrors.studentPhone = "رقم الطالب مطلوب";
    } else if (!validateEgyptianPhone(formData.studentPhone)) {
      newErrors.studentPhone = "رقم الهاتف غير صحيح";
    }

    if (!formData.fatherPhone.trim()) {
      newErrors.fatherPhone = "رقم الأب مطلوب";
    } else if (!validateEgyptianPhone(formData.fatherPhone)) {
      newErrors.fatherPhone = "رقم الهاتف غير صحيح";
    }

    if (formData.motherPhone && !validateEgyptianPhone(formData.motherPhone)) {
      newErrors.motherPhone = "رقم الهاتف غير صحيح";
    }

    // Check for unique phone numbers
    const phones = [formData.studentPhone, formData.fatherPhone, formData.motherPhone].filter(Boolean);
    const uniquePhones = new Set(phones);
    
    if (phones.length !== uniquePhones.size) {
      // Check which ones are duplicates
      if (formData.studentPhone === formData.fatherPhone) {
        newErrors.studentPhone = "رقم الطالب يجب أن يكون مختلف عن رقم الأب";
        newErrors.fatherPhone = "رقم الأب يجب أن يكون مختلف عن رقم الطالب";
      }
      if (formData.studentPhone === formData.motherPhone && formData.motherPhone) {
        newErrors.studentPhone = "رقم الطالب يجب أن يكون مختلف عن رقم الأم";
        newErrors.motherPhone = "رقم الأم يجب أن يكون مختلف عن رقم الطالب";
      }
      if (formData.fatherPhone === formData.motherPhone && formData.motherPhone) {
        newErrors.fatherPhone = "رقم الأب يجب أن يكون مختلف عن رقم الأم";
        newErrors.motherPhone = "رقم الأم يجب أن يكون مختلف عن رقم الأب";
      }
    }

    // Dropdowns validation
    if (!formData.governorate) newErrors.governorate = "اختر المحافظة";
    if (!formData.educationType) newErrors.educationType = "اختر نوع التعليم";
    if (!formData.department) newErrors.department = "اختر التخصص";

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 8) {
      newErrors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
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

    // Apply maxLength restrictions (only for phone numbers)
    const maxLengths: { [key: string]: number } = {
      studentPhone: 11,
      fatherPhone: 11,
      motherPhone: 11,
    };

    if (maxLengths[name] && value.length > maxLengths[name]) {
      value = value.substring(0, maxLengths[name]);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
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
      await register(formData);
      router.push("/dashboard");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 md:py-12">
      <Card className="section-reveal w-full max-w-[650px] rounded-2xl p-8 md:p-10 shadow-lg">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
            تسجيل جديد
          </p>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            إنشئ حسابك الآن
          </h1>
          <p className="mt-3 text-sm md:text-base text-[var(--text-secondary)]">
            انضم إلى منصة وليد زيادي لتعلم الرياضيات بطريقة أفضل
          </p>
        </div>

        {/* Form - 2 Column Grid Layout */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-y-[28px] gap-x-[24px] max-w-[600px] mx-auto">
          {/* Row 1: First Name & Second Name */}
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

          {/* Row 2: Third Name & Last Name */}
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
            label="الاسم الأخير"
            name="lastName"
            placeholder="محمود"
            icon={User}
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
          />

          {/* Row 3: Student Phone & Father Phone */}
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
            label="رقم الأب"
            name="fatherPhone"
            type="tel"
            placeholder="01098765432"
            icon={Phone}
            value={formData.fatherPhone}
            onChange={handleChange}
            error={errors.fatherPhone}
          />

          {/* Row 4: Mother Phone - Full Width */}
          <div className="md:col-span-2">
            <FormField
              label="رقم الأم"
              name="motherPhone"
              type="tel"
              placeholder="01155667788"
              icon={Phone}
              required={false}
              value={formData.motherPhone}
              onChange={handleChange}
              error={errors.motherPhone}
            />
          </div>

          {/* Row 5: Governorate - Full Width */}
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

          {/* Row 6: Education Type - Full Width */}
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

          {/* Row 7: Grade - Full Width */}
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

          {/* Row 8: Department - Full Width */}
          <div className="md:col-span-2">
            <SelectField
              label="التخصص"
              name="department"
              options={DEPARTMENTS}
              value={formData.department}
              onChange={handleChange}
              error={errors.department}
            />
          </div>

          {/* Row 9: Email - Full Width */}
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

          {/* Row 10: Password & Confirm Password */}
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

          {/* Submit Button - Full Width */}
          <button
            type="submit"
            disabled={isLoading}
            className="md:col-span-2 h-[52px] w-full mt-[32px] rounded-[10px] bg-[linear-gradient(135deg,var(--primary),var(--secondary))] text-white font-semibold hover:shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "جاري إنشاء الحساب..." : "انشئ الحساب"}
          </button>
          {submitError ? <p className="md:col-span-2 text-sm text-rose-500">{submitError}</p> : null}
        </form>

        {/* Sign In Link */}
        <p className="mt-[32px] text-center text-sm text-[var(--text-secondary)]">
          يوجد لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
            تسجيل الدخول
          </Link>
        </p>
      </Card>
    </div>
  );
}
