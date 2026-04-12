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

export async function updateMeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const authUser = req.user;
    if (!authUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = req.body as {
      email?: string;
      firstName?: string;
      lastName?: string;
    };

    const existingUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, profile: true },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const shouldUpdateProfileNames =
      (typeof payload.firstName === "string" || typeof payload.lastName === "string") &&
      Boolean(existingUser.profile);

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        ...(typeof payload.email === "string" ? { email: payload.email } : {}),
        ...(shouldUpdateProfileNames
          ? {
              profile: {
                update: {
                  ...(typeof payload.firstName === "string" ? { firstName: payload.firstName } : {}),
                  ...(typeof payload.lastName === "string" ? { lastName: payload.lastName } : {}),
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        email: true,
        role: true,
        profile: true,
        adminProfile: true,
      },
    });

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    return next(error);
  }
}
