import express from "express";
import rateLimit from "express-rate-limit";
import { incrementCompanyClick } from "../controllers/company.controller.js";
import { getCompanyProducts } from "../controllers/company.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeCompanyAdminOrSuperAdmin } from "../middleware/authorizeCompany.js";
import { getCompanyStats } from "../controllers/company.controller.js";
import { getCompanyStatsAdmin, getCompanyStatsPublic } from "../controllers/company.controller.js";
import { authorizeRoles } from "../middleware/authorize.js";
const router = express.Router();

const clickLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/:companyId/click", clickLimiter, incrementCompanyClick);
router.get("/my-products", authenticate, getCompanyProducts);
router.get(
  "/stats",
  authenticate,
  authorizeCompanyAdminOrSuperAdmin,
  getCompanyStats
);
// super admin / admin only
router.get(
  "/:companyId/stats/admin",
  authenticate,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  getCompanyStatsAdmin
);

// Public 
router.get(
  "/:companyId/stats",
  getCompanyStatsPublic
);
export default router;
