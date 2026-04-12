import { Router } from "express";
import { loginHandler, meHandler, registerHandler } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { loginSchema, registerSchema } from "./auth.schema";
import { requireAuth } from "../../middleware/auth";

const router = Router();

router.post("/register", validate(registerSchema), registerHandler);
router.post("/login", validate(loginSchema), loginHandler);
router.get("/me", requireAuth, meHandler);

export default router;
