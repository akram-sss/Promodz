import { Router } from "express";
import {
  getTopCompanies,
  createTopCompany,
  updateTopCompany,
  deleteTopCompany,
  reorderTopCompanies,
} from "../controllers/topCompany.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/authorize.js";

const router = Router();

// Public - anyone can view top companies
router.get("/", getTopCompanies);

// SUPER_ADMIN only - manage top companies
router.post("/", authenticate, authorizeRoles("SUPER_ADMIN"), createTopCompany);
router.put("/reorder", authenticate, authorizeRoles("SUPER_ADMIN"), reorderTopCompanies);
router.put("/:id", authenticate, authorizeRoles("SUPER_ADMIN"), updateTopCompany);
router.delete("/:id", authenticate, authorizeRoles("SUPER_ADMIN"), deleteTopCompany);

export default router;
