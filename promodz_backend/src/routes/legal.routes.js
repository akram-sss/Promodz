import { Router } from "express";
import {
  getLegalSections,
  createLegalSection,
  updateLegalSection,
  deleteLegalSection,
  reorderLegalSections,
} from "../controllers/legal.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/authorize.js";

const router = Router();

// Public — anyone can view legal sections
router.get("/", getLegalSections);

// SUPER_ADMIN only — manage legal sections
router.post("/", authenticate, authorizeRoles("SUPER_ADMIN"), createLegalSection);
router.put("/reorder", authenticate, authorizeRoles("SUPER_ADMIN"), reorderLegalSections);
router.put("/:id", authenticate, authorizeRoles("SUPER_ADMIN"), updateLegalSection);
router.delete("/:id", authenticate, authorizeRoles("SUPER_ADMIN"), deleteLegalSection);

export default router;
