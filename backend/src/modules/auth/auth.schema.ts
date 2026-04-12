import { z } from "zod";

const egyptianPhoneRegex = /^(01)[0-2,5]\d{8}$/;

export const registerSchema = z
  .object({
    firstName: z.string().min(1),
    secondName: z.string().min(1),
    thirdName: z.string().min(1),
    lastName: z.string().min(1),
    studentPhone: z.string().regex(egyptianPhoneRegex, "Invalid student phone"),
    fatherPhone: z.string().regex(egyptianPhoneRegex, "Invalid father phone"),
    motherPhone: z.string().regex(egyptianPhoneRegex, "Invalid mother phone").optional(),
    governorate: z.string().min(1),
    educationType: z.string().min(1),
    grade: z.string().min(1),
    department: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }

    const phones = [values.studentPhone, values.fatherPhone, values.motherPhone].filter(Boolean);
    if (new Set(phones).size !== phones.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["studentPhone"],
        message: "Phone numbers must be unique",
      });
    }
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
