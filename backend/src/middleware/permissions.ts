import { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/http-error";

type AdminPermissionKey =
  | "canManageCourses"
  | "canManageUsers"
  | "canManageContent"
  | "canManagePayments";

export function requireAdminPermission(permission: AdminPermissionKey) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, "Unauthorized"));
    }

    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    if (req.user.role !== UserRole.ADMIN) {
      return next(new HttpError(403, "Forbidden"));
    }

    const permissionRow = await prisma.adminPermission.findUnique({
      where: { adminId: req.user.id },
    });

    if (!permissionRow || !permissionRow[permission]) {
      return next(new HttpError(403, "Missing admin permission"));
    }

    return next();
  };
}
