import { Router } from "express";
import { loginHandler, meHandler, registerHandler, updateMeHandler } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { loginSchema, registerSchema, updateMeSchema } from "./auth.schema";
import { requireAuth } from "../../middleware/auth";

const router = Router();

router.post("/register", validate(registerSchema), registerHandler);
router.post("/login", validate(loginSchema), loginHandler);
router.get("/me", requireAuth, meHandler);
router.patch("/me", requireAuth, validate(updateMeSchema), updateMeHandler);

export default router;
