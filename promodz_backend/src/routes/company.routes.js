import express from "express";
import { incrementCompanyClick } from "../controllers/company.controller.js";
import { getCompanyProducts } from "../controllers/company.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeCompanyAdminOrSuperAdmin } from "../middleware/authorizeCompany.js";
import { getCompanyStats } from "../controllers/company.controller.js";
import { getCompanyStatsAdmin, getCompanyStatsPublic } from "../controllers/company.controller.js";
import { authorizeRoles } from "../middleware/authorize.js";
const router = express.Router();

router.post("/:companyId/click", incrementCompanyClick);
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
