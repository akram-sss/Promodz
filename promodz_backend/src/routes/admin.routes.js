import express from "express";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/authorize.js";
import { getAssignedCompanies } from "../controllers/admin.controller.js";

const router = express.Router();

// Admin/moderator gets all companies assigned to them
router.get("/assigned-companies", authenticate, authorizeRoles("ADMIN", "SUPER_ADMIN"), getAssignedCompanies);

export default router;