import { apiRequest } from "./client";
import { AuthResponse, AuthUser } from "./types";

export interface RegisterPayload {
  firstName: string;
  secondName: string;
  thirdName: string;
  lastName: string;
  studentPhone: string;
  fatherPhone: string;
  motherPhone?: string;
  governorate: string;
  educationType: string;
  grade: string;
  department: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function getMe(token: string) {
  const response = await apiRequest<{ user: AuthUser }>("/api/auth/me", {
    token,
  });
  return response.user;
}
