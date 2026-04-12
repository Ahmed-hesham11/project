import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/http-error";
import { signAccessToken } from "../../utils/jwt";
import { loginSchema, registerSchema } from "./auth.schema";

type RegisterInput = Omit<ReturnType<typeof registerSchema.parse>, "confirmPassword">;
type LoginInput = ReturnType<typeof loginSchema.parse>;

function sanitizeUser(user: { id: string; email: string; role: UserRole }) {
  return { id: user.id, email: user.email, role: user.role };
}

export async function registerStudent(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) {
    throw new HttpError(409, "Email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: UserRole.USER,
      profile: {
        create: {
          firstName: input.firstName,
          secondName: input.secondName,
          thirdName: input.thirdName,
          lastName: input.lastName,
          studentPhone: input.studentPhone,
          fatherPhone: input.fatherPhone,
          motherPhone: input.motherPhone,
          governorate: input.governorate,
          educationType: input.educationType,
          grade: input.grade,
          department: input.department,
        },
      },
    },
  });

  const safeUser = sanitizeUser(user);
  return {
    user: safeUser,
    accessToken: signAccessToken(safeUser),
  };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new HttpError(401, "Invalid credentials");
  }

  const safeUser = sanitizeUser(user);
  return {
    user: safeUser,
    accessToken: signAccessToken(safeUser),
  };
}
