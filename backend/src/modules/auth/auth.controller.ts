import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { login, registerStudent } from "./auth.service";

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body;
    const result = await registerStudent(payload);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await login(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function meHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const authUser = req.user;
    if (!authUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        role: true,
        profile: true,
        adminProfile: true,
      },
    });
    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
}
